// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const firebase = require('firebase/app');
require('firebase/database');
const axios = require('axios');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "code-in-the-drunk" is now active!');

  const config = {
    apiKey: 'AIzaSyBvHTT_5lH1YVFtaun3uALScW3-06V3lys',
    authDomain: 'code-in-the-drunk.firebaseapp.com',
    databaseURL: 'https://code-in-the-drunk.firebaseio.com',
    projectId: 'code-in-the-drunk',
    storageBucket: 'code-in-the-drunk.appspot.com',
    messagingSenderId: '575389870497',
  };
  firebase.initializeApp(config);

  let selectedRoom, username, userEvents;

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('extension.helloWorld', async () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the
    // await changeFontSize();
    await changeBackgroundColor();
  });

  let join = vscode.commands.registerCommand('extension.joinGame', async () => {
    vscode.window.showInformationMessage('Join Game');

    try {
      const roomsSnapshot = await firebase
        .database()
        .ref('/rooms')
        .once('value');

      const roomList = Object.keys(roomsSnapshot.val());

      selectedRoom = await vscode.window.showQuickPick(roomList, {
        placeHolder: 'Which room would you like to join?',
      });

      username = await vscode.window.showInputBox({
        prompt: 'What is your name?',
      });

      userEvents = new Map();
    } catch (error) {
      console.log(error);
    }

    let documents = new Map();
    let panel = null;
    let currentProgress = null;

    // #region Progress listener
    firebase
      .database()
      .ref(`/rooms/${selectedRoom}`)
      .on('value', async snapshot => {
        const room = snapshot.val();
        const { progress } = room.players[username] || {
          progress: 0,
        };

        if (room.isActive) {
          if (currentProgress !== progress) {
            await vscode.commands.executeCommand('workbench.action.closeAllEditors');
            panel = null;
          }

          if (!documents.has(progress) || documents.get(progress).isClosed) {
            const content = getCodeTemplate(progress);
            const document = await vscode.workspace.openTextDocument({
              content,
              language: 'javascript',
            });
            await vscode.window.showTextDocument(document, {
              column: vscode.ViewColumn.Three,
              preserveFocus: false,
            });
            documents.set(progress, document);
          }

          if (!panel) {
            panel = vscode.window.createWebviewPanel(
              'html',
              'Problem',
              {
                viewColumn: vscode.ViewColumn.Four,
              },
              {}
            );
          }

          panel.webview.html = getProblemContent(progress);

          currentProgress = progress;
        }
      });
    // #endregion

    firebase
      .database()
      .ref(`/rooms/${selectedRoom}/events`)
      .on('value', async snapshot => {
        const events = snapshot.val();
        const yourEvents = events
          .filter(event => event)
          .map((event, index) => {
            if (event.playerId === username) {
              return {
                id: index,
                ...event,
              };
            } else {
              return null;
            }
          })
          .filter(event => event);

        for (const event of yourEvents) {
          if (!userEvents.has(event.id)) {
            vscode.window.showWarningMessage(`Drink ${event.amount} shots !!!`);
            userEvents.set(event.id, events);
            switch (event.type) {
              default:
                await changeFontSize();
                break;
            }
          }
        }
      });
  });

  let submit = vscode.commands.registerCommand('extension.submitCode', async () => {
    // await fetch(
    //   `https://us-central1-code-in-the-drunk.cloudfunctions.net/api/rooms/${selectedRoom}/events`,
    //   {
    //     method: 'POST', // *GET, POST, PUT, DELETE, etc.
    //     headers: {
    //       'Content-Type': 'application/json',
    //     }, // no-referrer, *client
    //     body: JSON.stringify({
    //       playerId: username,
    //       type: 'fontSize',
    //     }), // body data type must match "Content-Type" header
    //   }
    // );

    await axios({
      method: 'post',
      url: `https://us-central1-code-in-the-drunk.cloudfunctions.net/api/rooms/${selectedRoom}/events`,
      data: {
        playerId: username,
        type: 'fontSize',
      },
    });
    console.log('Submit');
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(join);
  context.subscriptions.push(submit);
}

async function changeFontSize() {
  const config = vscode.workspace.getConfiguration(
    'editor',
    vscode.workspace.workspaceFolders[0].uri
  );
  try {
    const steps = [12, 32, 48, 12, 32, 48, 64, 48, 6, 12];
    for (const step of steps) {
      await config.update('fontSize', step, vscode.ConfigurationTarget.WorkspaceFolder);
      await timeout(500);
    }
  } catch (error) {
    console.log(error);
  }
}

async function changeBackgroundColor() {
  const config = vscode.workspace.getConfiguration(
    'workbench',
    vscode.workspace.workspaceFolders[0].uri
  );
  try {
    const colors = ['Monokai', 'Red'];
    for (const color of colors) {
      await config.update('colorTheme', color, vscode.ConfigurationTarget.WorkspaceFolder);
      await timeout(500);
    }
  } catch (error) {
    console.log(error);
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCodeTemplate(progress) {
  switch (progress) {
    case 0:
    case 1:
      return `
function solution(arrays) {
  Write your codes here;
}`;
    default:
      return `
function solution() {
};
`;
  }
}

function getProblemContent(progress) {
  switch (progress) {
    case 0:
      return `
        <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Code in the drunk</title>
          </head>
          <body>
              <h1>Problem 1</h1>
              <p>Write a function receive array of integers and return new array which contains only even number</p>
          </body>
        </html>`;
    case 1:
      return `
        <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Code in the drunk</title>
          </head>
          <body>
              <h1>Problem 2</h1>
              <p>Write a function receive array of integers and return new array which contains only odd number</p>
          </body>
        </html>`;
    case 2:
      return `
        <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Code in the drunk</title>
          </head>
          <body>
              <h1>Problem 3</h1>
              <p>
              You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.
              </p>
              <p>You may assume the two numbers do not contain any leading zero, except the number 0 itself.</p>
          </body>
        </html>`;
    case 3:
      return `
        <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Code in the drunk</title>
          </head>
          <body>
              <h1>Problem 4</h1>
              <p>Given a 32-bit signed integer, reverse digits of an integer.</p>
          </body>
        </html>`;
    case 4:
      return `
        <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Code in the drunk</title>
          </head>
          <body>
              <h1>Problem 5</h1>
              <p>Write a program that outputs the string representation of numbers from 1 to n.</p>
              <p>
              But for multiples of three it should output “Fizz” instead of the number and for the multiples of five output “Buzz”. For numbers which are multiples of both three and five output “FizzBuzz”.</p>
          </body>
        </html>`;
    case 5:
      return `
      <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code in the drunk</title>
        </head>
        <body>
            <h1>Congratulation!</h1>
            <h2>You win!</h2>
        </body>
      </html>`;
  }
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
