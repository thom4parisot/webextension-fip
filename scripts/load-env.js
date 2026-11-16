/**
 * Loads the `.env` file, when there is one.
 * Variables already set by the shell (or the CI) take precedence.
 */
export default function loadEnv () {
  try {
    process.loadEnvFile();
  }
  catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}
