# Deployment Fix: Removed Conflicting Dependency

## Issue

The deployment failed with an `ERESOLVE` error because of a dependency conflict:

- `react-split-flap-effect` requires React 16.x
- The project uses React 18.x

## Issue 2: Rollup Linux Binary Missing

After fixing the dependency conflict, the build failed with:
`Error: Cannot find module @rollup/rollup-linux-x64-gnu`

This happens because `package-lock.json` generated on macOS sometimes doesn't include the optional Linux-specific binaries needed by the deployment server.

## Solution

I completely regenerated the `package-lock.json` file to ensure all platform-specific optional dependencies are included.

1. Deleted `node_modules` and `package-lock.json`
2. Ran `npm install` fresh
3. Verified that `@rollup/rollup-linux-x64-gnu` is now present in the lockfile

## Next Steps

To fix the deployment, you need to commit and push the updated lockfile:

1. **Commit the changes:**

   ```bash
   git add package-lock.json
   git commit -m "fix: regenerate lockfile to include linux rollup bindings"
   git push
   ```

2. **Redeploy:**
   Cloudflare Pages will pick up the new lockfile and should now be able to find the Linux binary.
