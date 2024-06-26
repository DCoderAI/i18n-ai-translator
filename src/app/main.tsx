import React, { useCallback, useEffect, useState } from 'react';
import { Text, Box } from 'ink';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import LLMSelection from "./llm.js";
import Ollama from "./ollama.js";
import Bedrock from "./bedrock.js";
import { Config } from "./type.js";
import Translate from "./translate.js";
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';
import OpenAI from "./open-ai.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type ConfigStepProps = {
	onComplete: () => void;
}

const ConfigStep = ({onComplete}: ConfigStepProps) => {
	const [llm, setLLM] = useState<string>();

	const onModelSelection = useCallback(async (config: Config) => {
		await fs.writeJson(path.join(__dirname, "..", 'config.json'), {llm, config});
		onComplete();
	}, [llm]);

	if (!llm) {
		return <LLMSelection onComplete={setLLM}/>;
	}
	if (llm === 'ollama') {
		return <Ollama onComplete={onModelSelection}/>;
	} else if (llm === 'bedrock') {
		return <Bedrock onComplete={onModelSelection}/>;
	} else if (llm === 'open-ai') {
		return <OpenAI onComplete={onModelSelection}/>;
	}
	return <Text>Configuration complete.</Text>;
};


const App = () => {
	const [currentStep, setCurrentStep] = useState<'loading' | 'config' | 'translate'>('config');
	const getConfig = useCallback(async () => {
		const configPath = path.join(__dirname, "..", 'config.json');
		if (fs.existsSync(configPath)) {
			const config = await fs.readJson(configPath);
			if (config.llm) {
				setCurrentStep('translate');
			} else {
				setCurrentStep('config');
			}
		} else {
			// No config found, render config step
			setCurrentStep('config');
		}
	}, []);

	useEffect(() => {
		getConfig();
	}, []);

	if (currentStep === 'loading') {
		return <Text>Loading...</Text>;
	}

	// Determine which step to render based on command-line arguments or stored config

	return (
		<Box width="100%" flexDirection="column">
			<Box flexDirection="column" paddingBottom={2}>
				<Gradient name="instagram">
					<BigText text="Lingua Link AI"/>
				</Gradient>
				<Box width="100%" flexDirection="column">
					<Text bold={true}>Disclaimer:</Text>
					<Text>The translations are powered by AI and, while highly effective, may not always achieve perfection.</Text>
					<Text>Depending on context, some nuances, idioms, or cultural expressions might not be fully captured.</Text>
				</Box>
				<Box width="100%" flexDirection="column">
					<Text>Note: It only supports json, csv, tsv, md and mdx file format.</Text>
				</Box>
			</Box>
			<Box>{
				currentStep === 'config' ? <ConfigStep onComplete={() => {
					setCurrentStep('translate');
				}}/> : <Translate />
			}</Box>
		</Box>
	)
};

export default App;
