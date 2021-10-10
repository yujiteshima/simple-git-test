import * as functions from "firebase-functions";
import { promises as fs } from "fs";
import simpleGit, { SimpleGit } from 'simple-git';
import * as os from 'os';
import * as path from 'path';
import * as rimraf from 'rimraf';
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
export const getFilePath = (...files: string[]): string => {
  return path.join(os.tmpdir(), ...files);
}
// getFilePath('a', 'b', 'c.txt') -> /tmp/a/b/c.txt

export const clone = async (repoUrl: string, repoName: string): Promise<void> => {
  const localPath: string = path.join(os.tmpdir(), repoName);
  await deleteDir(localPath);
  const git: SimpleGit = simpleGit();
  await git.clone(repoUrl, localPath);
}

export const deleteDir = (localPath: string): Promise<void> => {
  return new Promise<void>((resolve) => {
    rimraf(localPath, () => {
      resolve();
    })
  })
}

export const push = async (project: string, branch: string): Promise<void> => {
  try {
    const localPath: string = path.join(os.tmpdir(), project);
    // Git needs to know whrer is has to run, that's why we pass
    // the pass to the constructor of simple-git
    const git: SimpleGit = simpleGit();
    // Configure Git with the username and email
    const username: string = functions.config().github.username;
    const email: string = functions.config().github.email;
    const token: string = functions.config().github.tokens;
    await git.push(``)
  } catch (e) {
    throw new Error(`Error pushing.`);
  }
}

export const helloWorld = functions.https.onRequest((request, response) => {
  const workingDirectory = "/tmp"
  const repositoryUrl = "https://github.com/yujiteshima/contentTest.git";
  // try {
  //   if(!fs.access(workingDirectory))
  // } catch (e) {
  //   console.error('エラー', erro)
  // }
  // let test: string = "initString";
  // fs.access('/temp', e => {
  //   test = e ? "it exists" : "no dir";
  // })
  // ルートディレクトリにtempディレクトリがあるか確認する
  //const filenames = fs.readdirSync("/");
  functions.logger.info("test" , { structuredData: true });
  response.send(filenames);
});

const checkDir = async (workingDirectory: string, repositoryUrl: string) => {
  if (!await fs.access(workingDirectory).then(() => true).catch(() => false)) {
    await simpleGit().clone(repositoryUrl, workingDirectory);
  }
}
