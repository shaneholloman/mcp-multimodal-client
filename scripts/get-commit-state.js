import fs from "fs";
import { execSync } from "child_process";
import path from "path";

function getRepoState() {
  try {
    // Get current date
    const date = new Date().toISOString();

    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const version = packageJson.version;

    // Get git information
    const gitStatus = execSync("git status --porcelain").toString();
    const gitBranch = execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim();
    const gitHash = execSync("git rev-parse HEAD").toString().trim();
    const gitDiff = execSync("git diff").toString();
    const stagedFiles = execSync("git diff --cached --name-only")
      .toString()
      .split("\n")
      .filter(Boolean);
    const modifiedFiles = execSync("git ls-files -m")
      .toString()
      .split("\n")
      .filter(Boolean);

    // Create state object
    const state = {
      date,
      version,
      gitBranch,
      gitHash,
      gitStatus: gitStatus.split("\n").filter(Boolean),
      stagedFiles,
      modifiedFiles,
      gitDiff,
    };

    // Write to file
    fs.writeFileSync(
      "./output/commit-state.json",
      JSON.stringify(state, null, 2),
      "utf8"
    );

    console.log("Repository state has been saved to commit-state.json");
  } catch (error) {
    console.error("Error getting repository state:", error.message);
    process.exit(1);
  }
}

getRepoState();
