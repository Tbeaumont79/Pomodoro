import * as vscode from "vscode";
import * as path from "path";
import { exec } from "child_process";
export function activate(context: vscode.ExtensionContext) {
  const pomodoroTime = 25 * 60;
  const breakTime = 5 * 60;
  let remainingTime = pomodoroTime;
  let isPomodoro = true;
  const startQuestSoundPath = path.join(__dirname, "sounds/", "quest_add.mp3");
  const endQuestSoundPath = path.join(
    __dirname,
    "sounds/",
    "quest_complete.mp3"
  );
  let interval: NodeJS.Timeout | undefined;

  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.text = `$(clock) Pomodoro: 25:00`;
  statusBar.tooltip = "toggle pomodoro";
  statusBar.command = "pomodoro.toggle";
  statusBar.show();
  const toggleCommand = vscode.commands.registerCommand(
    "pomodoro.toggle",
    () => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
        statusBar.text = `$(clock) Pomodoro: 25:00`;
        remainingTime = pomodoroTime;
      } else {
        soundPlayer(startQuestSoundPath);
        startTimer();
      }
    }
  );

  const startTimer = () => {
    interval = setInterval(() => {
      if (remainingTime > 0) {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        statusBar.text = `$(clock) ${
          isPomodoro ? "Pomodoro" : "Pause"
        }: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        remainingTime--;
      } else {
        if (isPomodoro) {
          soundPlayer(endQuestSoundPath);
        }

        vscode.window.showInformationMessage(
          isPomodoro
            ? "Pomodoro terminé ! Prenez une pause."
            : "Pause terminée ! Reprenez le travail."
        );
        isPomodoro = !isPomodoro;
        remainingTime = isPomodoro ? pomodoroTime : breakTime;
      }
    }, 1000);
  };
  const soundPlayer = (soundPath: string) => {
    exec(`sox ${soundPath} -d`, (error) => {
      vscode.window.showErrorMessage(error ? error.message : "");
    });
  };
  context.subscriptions.push(statusBar, toggleCommand);
}

export function deactivate() {}
