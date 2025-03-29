const { spawn } = require("child_process");
const path = require("path");

function runCommand(command, cwd) {
  const process = spawn(command, { shell: true, cwd, stdio: "inherit" });
  process.on("close", (code) => console.log(`Process in ${cwd} exited with code ${code}`));
}

// Chạy lệnh trong từng thư mục
runCommand("npm start", path.join(__dirname, "server"));
runCommand("npm run dev", path.join(__dirname, "admin"));
runCommand("npm run dev", path.join(__dirname, "coupon"));