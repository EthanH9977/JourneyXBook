import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive']; 
const ROOT_FOLDER_NAME = 'TravelBook';

// Helper: robust key cleaning for Vercel Env Vars
const getCleanPrivateKey = (key) => {
  if (!key) return '';
  // Remove wrapping quotes if present (common copy-paste error)
  let cleanKey = key.replace(/^"|"$/g, '');
  // Fix escaped newlines
  cleanKey = cleanKey.replace(/\\n/g, '\n');
  return cleanKey;
};

// Initialize Auth
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  getCleanPrivateKey(process.env.GOOGLE_PRIVATE_KEY),
  SCOPES
);

const drive = google.drive({ version: 'v3', auth });

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action, username, fileId, folderId, fileName } = req.query;

  try {
    // 1. Helper: Find the Root 'TravelBook' Folder
    const getRootId = async () => {
      // Vital: supportsAllDrives=true allows the bot to see folders shared with it
      const q = `name = '${ROOT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      const response = await drive.files.list({ 
        q, 
        fields: 'files(id, name)',
        supportsAllDrives: true, 
        includeItemsFromAllDrives: true 
      });
      
      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }
      return null;
    };

    // 2. Helper: Find or Create User Folder
    const getUserFolderId = async (rootId, user) => {
      const q = `name = '${user}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      const response = await drive.files.list({ 
        q, 
        fields: 'files(id, name)',
        supportsAllDrives: true, 
        includeItemsFromAllDrives: true 
      });
      
      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create
      const createRes = await drive.files.create({
        requestBody: {
          name: user,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootId]
        },
        fields: 'id',
        supportsAllDrives: true
      });
      return createRes.data.id;
    };

    // --- Actions ---

    if (req.method === 'GET') {
      
      // A. LIST Files for a User
      if (action === 'list' && username) {
        const rootId = await getRootId();
        
        if (!rootId) {
            // Specific Error for Frontend
            return res.status(404).json({ 
                error: 'ROOT_FOLDER_NOT_FOUND', 
                serviceAccountEmail: process.env.GOOGLE_CLIENT_EMAIL 
            });
        }

        const userFolderId = await getUserFolderId(rootId, username);
        
        const fileListRes = await drive.files.list({
          q: `'${userFolderId}' in parents and mimeType = 'application/json' and trashed = false`,
          fields: 'files(id, name)',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });

        return res.status(200).json({
          userFolderId,
          files: fileListRes.data.files || []
        });
      }

      // B. GET Single File Content
      if (action === 'get' && fileId) {
        const fileRes = await drive.files.get({
          fileId: fileId,
          alt: 'media',
          supportsAllDrives: true
        });
        return res.status(200).json(fileRes.data);
      }
    }

    if (req.method === 'POST') {
      // C. SAVE (Create or Update)
      const { data } = req.body; 
      
      if (!data) return res.status(400).json({ error: 'No data provided' });

      // Update existing
      if (fileId) {
        await drive.files.update({
          fileId: fileId,
          requestBody: {}, // metadata updates if any
          media: {
            mimeType: 'application/json',
            body: JSON.stringify(data, null, 2)
          },
          supportsAllDrives: true
        });
        return res.status(200).json({ id: fileId });
      }
      
      // Create New
      if (fileName && folderId) {
        const name = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
        const createRes = await drive.files.create({
          requestBody: {
            name: name,
            mimeType: 'application/json',
            parents: [folderId] // Verify this matches userFolderId
          },
          media: {
            mimeType: 'application/json',
            body: JSON.stringify(data, null, 2)
          },
          fields: 'id, parents', // Request parents back to verify
          supportsAllDrives: true
        });
        
        // Sanity Check
        const createdFile = createRes.data;
        if (!createdFile.parents || !createdFile.parents.includes(folderId)) {
             console.warn(`File created but parent mismatch. Expected ${folderId}, got ${createdFile.parents}`);
        }

        return res.status(200).json({ id: createdFile.id });
      }
    }

    return res.status(400).json({ error: 'Invalid action or missing parameters' });

  } catch (error) {
    console.error('Drive API Error:', error);
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}