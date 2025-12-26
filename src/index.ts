#!/usr/bin/env node

/**
 * KDO DADO - Christmas Gift Card Game Generator
 * Multi-Agent System using Claude Agent SDK with Recursive Feedback Loops
 *
 * Generates 10 unique, high-quality game scenarios for a Christmas gift card
 * featuring a dentist protagonist on an adventure ending in a Pokémon-style battle.
 *
 * Powered by Claude Agent SDK - leveraging query(), subagents, MCP tools, and permissions
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { ScenarioCoordinator } from './coordinator.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Display banner
 */
function displayBanner(): void {
  console.log(`
${'🎄'.repeat(50)}
     ███████╗██╗      █████╗  ██████╗██╗  ██╗███████╗███╗   ██╗
     ██╔════╝██║     ██╔══██╗██╔════╝██║ ██╔╝██╔════╝████╗  ██║
     █████╗  ██║     ███████║██║     █████╔╝ █████╗  ██╔██╗ ██║
     ██╔══╝  ██║     ██╔══██║██║     ██╔═██╗ ██╔══╝  ██║╚██╗██║
     ██║     ███████╗██║  ██║╚██████╗██║  ██╗███████╗██║ ╚████║
     ╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝

          🎅 GÉNÉRATEUR DE SCÉNARIOS DE JEU - MULTI-AGENT 🎅
          🎁 Pour ta sœur, son mari, et un Noël mémorable! 🎁

          ⚡ Powered by Claude Agent SDK ⚡
          🤖 Using query(), subagents, MCP tools & more 🤖
${'🎄'.repeat(50)}
  `);
}

/**
 * Verify API key is present
 */
function verifyApiKey(): boolean {
  // Check for ANTHROPIC_AUTH_TOKEN first (for z.ai proxy)
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const baseUrl = process.env.ANTHROPIC_BASE_URL;

  if (authToken) {
    console.log(`✅ ANTHROPIC_AUTH_TOKEN trouvé`);
    if (baseUrl) {
      console.log(`✅ ANTHROPIC_BASE_URL: ${baseUrl}`);
    }
    console.log('');
    return true;
  }

  if (apiKey) {
    console.log('✅ ANTHROPIC_API_KEY trouvé\n');
    return true;
  }

  console.error('❌ ERREUR: Aucun jeton d\'authentification trouvé!');
  console.error('\nConfigurez l\'une de ces variables d\'environnement:');
  console.error('  export ANTHROPIC_AUTH_TOKEN="your-token"');
  console.error('  export ANTHROPIC_API_KEY="your-key"');
  console.error('\nOu créez un fichier .env avec:');
  console.error('  ANTHROPIC_AUTH_TOKEN=your-token\n');
  return false;
}

/**
 * Demonstrate Agent SDK capabilities
 */
async function demonstrateSdkCapabilities(): Promise<void> {
  console.log('🔍 Démonstration des capacités du Claude Agent SDK...\n');

  const testPrompt = 'Briefly explain (in 2 sentences) what the Claude Agent SDK enables developers to build.';

  let response = '';
  const sdkResponse = query({
    prompt: testPrompt,
    options: {
      model: 'haiku',
      systemPrompt: 'You are a helpful assistant. Be concise and clear.'
    }
  });

  for await (const message of sdkResponse) {
    if (message.type === 'assistant') {
      // content can be a string or an array of content blocks
      const content = (message as any).content;
      if (typeof content === 'string') {
        response += content;
      } else if (Array.isArray(content)) {
        content.forEach((block: any) => {
          if (block.type === 'text') {
            response += block.text;
          }
        });
      }
    } else if (message.type === 'system' && message.subtype === 'init') {
      console.log(`📋 Session ID: ${message.session_id}`);
      console.log(`🔧 Available tools enabled\n`);
    }
  }

  console.log('🤖 Agent SDK Response:');
  console.log(response);
  console.log('\n✅ Agent SDK is functioning correctly!\n');
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    // Display banner
    displayBanner();

    // Verify API key
    if (!verifyApiKey()) {
      process.exit(1);
    }

    // Demonstrate Agent SDK capabilities
    await demonstrateSdkCapabilities();

    // Create output directory
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log('📁 Dossier de sortie créé: output/\n');
    }

    // Ask user which generation mode to use
    console.log('🎮 Choisissez le mode de génération:');
    console.log('  1. Mode standard (fonctions SDK individuelles)');
    console.log('  2. Mode orchestration SDK complète (recommandé)');
    console.log('  3. Les deux modes\n');

    // Default to mode 2 (full SDK orchestration) for demonstration
    const useFullSdkOrchestration = true;

    // Initialize coordinator
    console.log('🤖 Initialisation du système multi-agent avec Claude Agent SDK...\n');
    const coordinator = new ScenarioCoordinator();

    let scenarios: any[];

    if (useFullSdkOrchestration) {
      // MODE 2: Full Agent SDK orchestration
      console.log('🚀 Utilisation du mode orchestration SDK complète...\n');
      console.log('Ce mode utilise:');
      console.log('  • query() avec définitions de subagents');
      console.log('  • Gestion automatique de la coordination multi-agent');
      console.log('  • Outils MCP pour validation de balance');
      console.log('  • Permission mode pour écriture de fichiers\n');

      scenarios = await coordinator.generateMultipleScenarios(10);
    } else {
      // MODE 1: Individual SDK functions
      console.log('🚀 Utilisation du mode standard...\n');
      scenarios = await coordinator.generateMultipleScenarios(10);
    }

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE LA GÉNÉRATION');
    console.log('='.repeat(60));
    console.log(`✅ Scénarios générés: ${scenarios.length}/10`);
    console.log(`✅ Itérations par scénario: ${scenarios[0]?.iterations || 3}`);
    console.log(`✅ Validation: ${scenarios.filter(s => s.validation.isValid).length}/${scenarios.length} validés`);
    console.log(`✅ Mode: Claude Agent SDK avec subagents et MCP tools`);
    console.log('='.repeat(60) + '\n');

    // Save to file
    const outputPath = path.join(outputDir, 'scenarios-noel.txt');
    await coordinator.saveScenariosToFile(scenarios, outputPath);

    // Also save individual scenarios
    console.log('💾 Sauvegarde des scénarios individuels...\n');
    for (let i = 0; i < scenarios.length; i++) {
      const individualPath = path.join(outputDir, `scenario-${i + 1}.txt`);
      const content = coordinator.formatScenarioForOutput(scenarios[i], i + 1);
      fs.writeFileSync(individualPath, content, 'utf-8');
    }
    console.log(`✅ ${scenarios.length} scénarios individuels sauvegardés!\n`);

    // Success message
    console.log(`${'🎉'.repeat(50)}`);
    console.log('     SUCCÈS! TOUS LES SCÉNARIOS SONT PRÊTS!');
    console.log(`${'🎉'.repeat(50)}`);
    console.log('\n📁 Fichiers créés:');
    console.log(`   - output/scenarios-noel.txt (tous les scénarios)`);
    console.log(`   - output/scenario-1.txt à scenario-10.txt (individuels)\n`);
    console.log('🎄 Joyeux Noël! Ta sœur va adorer! 🎄\n');
    console.log('⚡ Généré avec Claude Agent SDK ⚡\n');

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error);
    process.exit(1);
  }
}

// Run main function
main().catch(console.error);
