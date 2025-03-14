# Contributing

Before starting any work, please open an Issue to discuss the changes you'd like to make; let's make sure we don't duplicate effort.

Please do all your work on a fork of the repository and open a PR against the main branch.

## Running the server locally

```
npm run build
npm run start
```

## Generating types

1. Download the Stability AI OpenAPI schema: https://platform.stability.ai/docs/api-reference
2. Run the following command to generate the types:

```
npx openapi-typescript openapi.json -o /path/to/mcp-server-stability/src/stabilityAiApi/types.ts
```

## Debugging tools

### Running Inspector

```
npx @modelcontextprotocol/inspector node path/to/mcp-server-stability-ai/build/index.js
```

### Claude

#### Follow logs in real-time

```
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
```

## Testing with a test.ts file

Helpful for isolating and trying out pieces of code.

1. Create a `src/test.ts` file.
2. Write something like this in it

```ts
import * as dotenv from "dotenv";
import { StabilityAiApiClient } from "./stabilityAi/stabilityAiApiClient.js";
import * as fs from "fs";

dotenv.config();

if (!process.env.STABILITY_AI_API_KEY) {
	throw new Error("STABILITY_AI_API_KEY is required in .env file");
}

const API_KEY = process.env.STABILITY_AI_API_KEY;

async function test() {
	const client = new StabilityAiApiClient(API_KEY);
	const data = await client.generateImageCore(
		"A beautiful sunset over mountains"
	);

	// Create the directory if it doesn't exist
	fs.mkdirSync("stabilityAi", { recursive: true });

	// Write data to file
	fs.writeFileSync("stabilityAi/test.png", data.base64Image, "base64");
	console.log("Image saved to stabilityAi/test.png");
}

test().catch(console.error);
```

3. `npm run build` and `node build/test.js`

## Publishing

```
npm run build
```

Delete any files that shouldn't be published (e.g. `build/test.js`). Then run:

```
npm publish
```

After publishing, tag the GitHub repository with the version from package.json and add release notes:

```
# Get the version from package.json
VERSION=$(node -p "require('./package.json').version")

# Create an annotated tag with a message
git tag -a v$VERSION -m "Release v$VERSION"

# Push the tag to the remote repository
git push origin v$VERSION

# Create a GitHub release with more detailed notes
# You can do this through the GitHub UI:
# 1. Go to https://github.com/tadasant/mcp-server-stability-ai/releases
# 2. Click "Draft a new release"
# 3. Select the tag you just pushed
# 4. Add a title (e.g., "v1.2.0")
# 5. Add detailed release notes describing the changes
# 6. Click "Publish release"
```

TODO: Automate these steps.
