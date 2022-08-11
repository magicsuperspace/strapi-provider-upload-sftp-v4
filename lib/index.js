const path = require('path');
const getSFTPConnection = require('./utils/getSFTPConnection');

module.exports = {
  init: config => {
    const { host, port, user, password, baseUrl, basePath } = config;

    const connection = async () => getSFTPConnection(host, port, user, password);

    return {
      upload: async (file) => {
        const sftp = await connection();
        const files = await sftp.list(basePath);

        let fileName = `${file.hash}${file.ext}`;
        let c = 0;

        const hasName = f => f.name === fileName;

        // scans directory files to prevent files with the same name
        while (files.some(hasName)) {
          c += 1;
          fileName = `${file.hash}(${c})${file.ext}`;
        }

        try {
          await sftp.put(file.buffer, path.resolve(basePath, fileName))
        } catch (e) {
          console.error(e);
        }

        /* eslint-enable no-param-reassign */
        file.public_id = fileName;
        file.url = `${baseUrl}${fileName}`;
        /* eslint-disable no-param-reassign */

        await sftp.end();

        return file;
      },
      uploadStream: async (file) => {
        const sftp = await connection();
        const files = await sftp.list(basePath);

        let fileName = `${file.hash}${file.ext}`;
        let c = 0;

        const hasName = f => f.name === fileName;

        // scans directory files to prevent files with the same name
        while (files.some(hasName)) {
          c += 1;
          fileName = `${file.hash}(${c})${file.ext}`;
        }

        try {
          console.log('to be input', file.stream);
          await sftp.put(file.stream, path.resolve(basePath, fileName))
        } catch (e) {
          console.error('UPLOAD ERROR', e);
        }

        /* eslint-enable no-param-reassign */
        file.public_id = fileName;
        file.url = `${baseUrl}${fileName}`;
        /* eslint-disable no-param-reassign */

        await sftp.end();

        return file;
      },
      delete: async (file) => {
        const sftp = await connection();

        try {
          await sftp.delete(`${basePath}/${file.hash}${file.ext}`);
        } catch (e) {
          console.error(e);
        }

        await sftp.end();

        return file;
      },
    };
  },
};
