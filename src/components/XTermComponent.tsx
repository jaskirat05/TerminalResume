import { Show } from "@/app/models";
import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import "xterm/css/xterm.css";

// Claude Code inspired palette
const ORANGE = "\x1b[38;2;217;119;87m"; // #D97757
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const PROMPT = ORANGE + "❯ " + RESET;

interface XTermComponentProps {
  showOrHideVisuals: (show: Show, visible: boolean) => void;
  onProgressChanged: (inProgress: boolean) => void;
}

const XTermComponent: React.FC<XTermComponentProps> = ({
  showOrHideVisuals: onCustomFunction,
  onProgressChanged,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a fresh Terminal instance per mount. Creating it here (rather than
    // in the component body) avoids the React StrictMode double-mount bug where
    // a disposed terminal is re-opened, throwing "Cannot read properties of
    // undefined (reading 'dimensions')".
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 16,
      fontFamily: '"Fira Code", monospace',
      theme: {
        background: "#1b1b1b", // Claude Code dark background
        foreground: "#e8e4dc", // warm off-white
        cursor: "#d97757", // Claude orange
        cursorAccent: "#1b1b1b",
        selectionBackground: "#3d3a36",
        selectionForeground: "#e8e4dc",
        black: "#1b1b1b",
        red: "#e0574b",
        green: "#7ca876",
        yellow: "#d9a640",
        blue: "#7d9fc7",
        magenta: "#b576b0",
        cyan: "#6aa6a0",
        white: "#e8e4dc",
        brightBlack: "#6e6a63",
        brightRed: "#e8837a",
        brightGreen: "#a3c29a",
        brightYellow: "#e0b96a",
        brightBlue: "#9db8d8",
        brightMagenta: "#cd9fc8",
        brightCyan: "#8cbdb8",
        brightWhite: "#f5f1ea",
      },
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    let currentLine = "";

    function printLogo() {
      const logo = [
        "     ██╗███████╗",
        "     ██║██╔════╝",
        "     ██║███████╗",
        "██   ██║╚════██║",
        "╚█████╔╝███████║",
        " ╚════╝ ╚══════╝",
      ];
      logo.forEach((line) => terminal.writeln(`${ORANGE}${line}${RESET}`));
      terminal.writeln("");
      terminal.writeln(
        `${BOLD}Jaskirat Singh${RESET}  ${DIM}· interactive terminal resume${RESET}`
      );
      terminal.writeln("");
    }

    function welcomeMessage() {
      terminal.writeln(
        `${DIM}Type ${ORANGE}/help${RESET}${DIM} to see available commands, or ${ORANGE}/download${RESET}${DIM} to get the latest resume.${RESET}`
      );
    }

    function helpMessage() {
      terminal.writeln(`${ORANGE}Jaskirat Singh's resume${RESET}`);
      terminal.writeln("");
      terminal.writeln(`${BOLD}COMMANDS${RESET}`);
      terminal.writeln(`    ${ORANGE}/help${RESET}         Show this help`);
      terminal.writeln(`    ${ORANGE}/download${RESET}     Download the latest resume (PDF)`);
      terminal.writeln(`    ${ORANGE}/employment${RESET}   Show employment history visually`);
      terminal.writeln(`    ${ORANGE}/education${RESET}    Show education history visually`);
      terminal.writeln(`    ${ORANGE}/contact${RESET}      How to get in touch`);
      terminal.writeln(`    ${ORANGE}/exit${RESET}         Leave the terminal`);
      terminal.writeln("");
      terminal.writeln(
        `${DIM}Anything else (longer than 3 chars) is answered by a GPT assistant trained on my resume.${RESET}`
      );
    }

    function handleInput(data: string | Uint8Array) {
      if (data === "\x1b") {
        // Escape key
        onCustomFunction(Show.All, false);
        currentLine = "";
      } else if (data === "\r") {
        // Enter
        processInput(currentLine).then(() => {
          terminal.write(PROMPT);
          currentLine = "";
        });
      } else if (data === "\x7f" || data === "\b") {
        // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.substring(0, currentLine.length - 1);
          terminal.write("\b \b");
        }
      } else {
        currentLine += data;
        terminal.write(data);
      }
    }

    async function processInput(input: string) {
      terminal.writeln("");
      console.log("User entered:", input);

      // Normalize: accept "help" and "/help" (strip a leading slash).
      const cmd = input.toLowerCase().trim().replace(/^\//, "");

      switch (cmd) {
        case "man resume":
        case "help":
          helpMessage();
          break;
        case "welcome":
          welcomeMessage();
          break;
        case "employment":
          onCustomFunction(Show.Employment, true);
          terminal.writeln(
            "\x1b[33m⚙️ \x1b[3mShowing employment history visually\x1b[23m\x1b[0m"
          );
          break;
        case "education":
          onCustomFunction(Show.Education, true);
          terminal.writeln(
            "\x1b[33m⚙️ \x1b[3mShowing education history visually\x1b[23m\x1b[0m"
          );
          break;
        case "hide":
          onCustomFunction(Show.All, false);
          break;
        case "download":
          terminal.writeln(
            `${DIM}Downloading the latest resume (PDF)…${RESET}`
          );
          window.open("/resume.pdf", "_blank");
          break;
        case "contact":
          terminal.writeln(
            "\x1b[33m⚙️ \x1b[3mYou can contact me through email or LinkedIn.\x1b[23m\x1b[0m"
          );
          break;
        case "exit":
          terminal.writeln(
            "\x1b[33m⚙️ \x1b[3mExiting…\x1b[23m\x1b[0m"
          );
          break;
        default:
          if (input.trim().length > 3) await communicateWithAi(input);
          else
            terminal.writeln(
              "\x1b[33m⚙️ \x1b[3mInput too short for AI to answer.\x1b[23m\x1b[0m"
            );
          break;
      }
    }

    async function communicateWithAi(input: string) {
      const data = { question: input };
      onProgressChanged(true);
      try {
        const res = await fetch("/api/openai", {
          method: "POST",
          body: JSON.stringify(data),
        });
        onProgressChanged(false);
        const jsonRes = await res.json();
        console.log(JSON.stringify(jsonRes));
        const answer = jsonRes.message;

        terminal.writeln("\x1b[32m🤖 \x1b[3m" + answer + "\x1b[23m\x1b[0m");
        terminal.writeln("");
        console.log("Assistant responds:", answer);
      } catch {
        onProgressChanged(false);
        terminal.writeln(
          "\x1b[32m🤖 \x1b[3m Failed to answer this question. Try asking differently.\x1b[23m\x1b[0m"
        );
      }
    }

    if (terminalRef.current) {
      terminal.open(terminalRef.current);

      // Defer fit so the container has been laid out (avoids 0-dimension fit).
      const fit = () => {
        try {
          fitAddon.fit();
        } catch (e) {
          console.error("fit failed", e);
        }
      };
      // Fit on the next frame, and again shortly after, so a slow layout
      // doesn't leave the terminal blank / zero-height.
      requestAnimationFrame(fit);
      const initialFit = setTimeout(fit, 50);

      let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(fit, 100);
      };
      window.addEventListener("resize", handleResize);

      terminal.onData(handleInput);

      printLogo();
      welcomeMessage();
      terminal.writeln("");
      terminal.write(PROMPT);

      return () => {
        clearTimeout(initialFit);
        clearTimeout(resizeTimeout);
        window.removeEventListener("resize", handleResize);
        terminal.dispose();
      };
    }
  }, []);

  return <div className="h-full w-full" ref={terminalRef} />;
};

export default XTermComponent;
