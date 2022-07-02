import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as fs from "fs";
import simpleGit, { SimpleGit } from 'simple-git';
import * as os from 'os';
import * as path from 'path';
import * as rimraf from 'rimraf';
import parseMD from './parse_md';
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
admin.initializeApp();
const storage = admin.storage();

export const getFilePath = (...files: string[]): string => {
  return path.join(os.tmpdir(), ...files);
}
// getFilePath('a', 'b', 'c.txt') -> /tmp/a/b/c.txt

export const clone = async (repoUrl: string, repoName: string): Promise<void> => {
  //const clonedir = "/Users/yujiteshima/tmp"; // localtest path
  const clonedir = "/tmp"; // firebase path
  //const localPath: string = path.join(os.tmpdir(), repoName);
  await deleteDir(`${clonedir}/contentTest`);
  const git: SimpleGit = simpleGit();
  await git.clone(repoUrl, `${clonedir}/contentTest`);
  const dirnames: string[] = fs.readdirSync(`${clonedir}/contentTest/content_1`);
  functions.logger.info(dirnames, { structuredData: true });
  // TODO: ここからループしてファイルを一つずつパースしてjsonに詰めていく。
  let parsefile: string = "";

  for (let i: number = 0; i < dirnames.length; i++){
    const filestring: string = fs.readFileSync(`${clonedir}/contentTest/content_1/${dirnames[i]}`, 'utf-8');
    parsefile += JSON.stringify(parseMD(filestring)) + ",";
  }
  //const filestring: string = fs.readFileSync(`${clonedir}/contentTest/content_1/${dirnames[0]}`, 'utf-8');
  //console.log(filestring);
  //const { metadata, content } = parseMD(filestring);
  //const parsefile: string = JSON.stringify(parseMD(filestring));
  //console.log(metadata);
  //console.log(content);
  //console.log("-------");
  //console.log(parsefile);
  console.log("{" + parsefile + "}");

  const file = storage.bucket().file("blogData.txt");
  try {
    await file.save("{" + parsefile+ "}");
  // contentTypeは別でセットしないとダメ
  await file.setMetadata({ contentType: 'text/plain' });
  } catch (err) {
  console.log(err);
  }
  
  try {
    const downloadFile: Buffer[] = await file.download();
    //(new TextDecoder).decode(Uint8Array.of(...downloadFile))
    console.log(downloadFile);
    console.log(downloadFile.toString());
  }catch (err) {
  console.log(err);
  }
  //const mdfile = fs.readFileSync(clonedir + "")
  //await deleteDir(localPath);
  await deleteDir(`${clonedir}/contentTest`);
  const after_dirnames = fs.readdirSync(`${clonedir}`);
  functions.logger.info(after_dirnames, { structuredData: true });
}

export const deleteDir = (localPath: string): Promise<void> => {
  return new Promise<void>((resolve) => {
    rimraf(localPath, () => {
      resolve();
    })
  })
}

// export const push = async (project: string, branch: string): Promise<void> => {
//   try {
//     const localPath: string = path.join(os.tmpdir(), project);
//     // Git needs to know whrer is has to run, that's why we pass
//     // the pass to the constructor of simple-git
//     const git: SimpleGit = simpleGit();
//     // Configure Git with the username and email
//     const username: string = functions.config().github.username;
//     const email: string = functions.config().github.email;
//     const token: string = functions.config().github.tokens;
//     await git.push(``)
//   } catch (e) {
//     throw new Error(`Error pushing.`);
//   }
// }

export const helloWorld = functions.https.onRequest((request, response) => {
  //const workingDirectory = "/tmp"
  //const workingDirectory = "/Users/yujiteshima/tmp/content_1/";
  const repositoryUrl = "https://github.com/yujiteshima/contentTest"
  const repositoryName = "content_1";
  clone(repositoryUrl, repositoryName);
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
  const filenames = fs.readdirSync("/tmp");
  functions.logger.info("test" , { structuredData: true });
  response.send(filenames);
});

// const checkDir = async (workingDirectory: string, repositoryUrl: string) => {
//   if (!await fs.access(workingDirectory).then(() => true).catch(() => false)) {
//     await simpleGit().clone(repositoryUrl, workingDirectory);
//   }
// }
