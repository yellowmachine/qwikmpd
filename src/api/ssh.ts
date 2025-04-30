import { NodeSSH } from 'node-ssh';
import { getDb } from '~/server/db';
import { decrypt } from '~/server/crypt';

export type Host = {ip: string, username: string, password: string}


export async function executeSSH(command: string, host: Host, secret: string) {
  const ssh = new NodeSSH();
  try {
    await ssh.connect({
      host: host.ip,
      username: host.username,
      password: decrypt(secret, host.password)
    });

    const { stdout, stderr } = await ssh.execCommand(`${command}`);
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout;
  } finally {
    ssh.dispose();
  }
}



export const executeSSHServer = async (command: string, secret: string) => {
    const db = await getDb();
    const data = await db.getDataWithPassword();
    const server = data.admin.server;
    //if(!server) throw new Error('Server not found');
  
    return await executeSSH(command, server, secret);
}