import * as vscode from "vscode";
import { exec } from "child_process";

const START_SOUND =
  "/Users/thibaultbeaumont/Documents/Pomodoro/public/sounds/quest_add.mp3";
const END_SOUND =
  "/Users/thibaultbeaumont/Documents/Pomodoro/public/sounds/quest_complete.mp3";
export function activate(context: vscode.ExtensionContext) {
  const pomodoroTime = 25 * 60;
  const breakTime = 5 * 60;
  let remainingTime = pomodoroTime;
  let isPomodoro = true;

  let interval: NodeJS.Timeout | undefined;
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  const toggleCommand = vscode.commands.registerCommand(
    "pomodoro.toggle",
    () => {
      statusBar.text = `$(clock) Pomodoro: 25:00`;
      statusBar.tooltip = "toggle pomodoro";
      statusBar.command = "pomodoro.toggle";
      statusBar.show();

      if (interval) {
        clearInterval(interval);
        interval = undefined;
        statusBar.text = `$(clock) Pomodoro: 25:00`;
        remainingTime = pomodoroTime;
      } else {
        soundPlayer(START_SOUND);
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
          soundPlayer(END_SOUND);
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
    exec(`play ${soundPath}`, (error) => {
      vscode.window.showErrorMessage(error ? error.message : "");
    });
  };
  context.subscriptions.push(statusBar, toggleCommand);
}

export function deactivate() {}
