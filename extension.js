// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// const firebase = require('firebase');

// require('firebase/firestore');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let db;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "code-in-the-drunk" is now active!');

  vscode.window.showInformationMessage('Join the game');

  // db = firebase.firestore();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('extension.helloWorld', function() {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World!');
  });

  // let join = vscode.commands.registerCommand('extension.joinGame', function() {
  //   vscode.window.showInformationMessage('Join Game');

  //   db.collection('tests')
  //     .get()
  //     .then(querySnapshot => {
  //       querySnapshot.forEach(doc => {
  //         vscode.window.showInformationMessage(`${doc.id}`);
  //       });
  //     });

  //   const doc = db.collection('cities').doc('SF');

  //   const observer = doc.onSnapshot(
  //     docSnapshot => {
  //       console.log(`Received doc snapshot: ${docSnapshot}`);
  //     },
  //     err => {
  //       console.log(`Encountered error: ${err}`);
  //     }
  //   );
  // });

  context.subscriptions.push(disposable);
  // context.subscriptions.push(join);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
