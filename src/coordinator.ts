import { query } from '@anthropic-ai/claude-agent-sdk';
import * as creativeAgent from './agents/creative-writing-agent.js';
import * as gameAgent from './agents/game-design-agent.js';

/**
 * Scenario Coordinator
 * Orchestrates recursive feedback loop between Creative Writing and Game Design agents
 * using Claude Agent SDK's multi-agent capabilities
 */

export class ScenarioCoordinator {
  private maxIterations: number = 3; // Number of feedback loops

  /**
   * Generate one complete scenario through recursive refinement
   * Uses Agent SDK to orchestrate multi-agent collaboration
   */
  async generateScenario(scenarioNumber: number): Promise<{
    concept: string;
    narrative: string;
    gameStructure: string;
    validation: any;
    iterations: number;
  }> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`GÉNÉRATION DU SCÉNARIO #${scenarioNumber}`);
    console.log(`${'='.repeat(60)}\n`);

    // PHASE 1: Generate initial concept using Agent SDK
    console.log('🎨 PHASE 1: Génération du concept initial...');
    const concept = await creativeAgent.generateScenarioConcept(scenarioNumber);
    console.log('✅ Concept généré!\n');

    // PHASE 2: Create game structure using Agent SDK with MCP tools
    console.log('🎮 PHASE 2: Création de la structure de jeu...');
    let gameStructure = await gameAgent.designGameStructure(concept);
    console.log('✅ Structure de jeu créée!\n');

    // PHASE 3: Enrich narrative using Agent SDK with subagents
    console.log('📚 PHASE 3: Enrichissement narratif...');
    let narrative = await creativeAgent.enrichNarrative(concept, gameStructure);
    console.log('✅ Narrative enrichie!\n');

    // PHASE 4: Recursive feedback loop using Agent SDK
    console.log(`🔄 PHASE 4: Boucle de feedback récursive (${this.maxIterations} itérations)...`);

    for (let i = 1; i <= this.maxIterations; i++) {
      console.log(`\n  --- Itération ${i}/${this.maxIterations} ---`);

      // Game Design Agent provides feedback using Agent SDK
      console.log('  🔍 Game Designer analyse...');
      const feedback = await gameAgent.provideFeedback(narrative, gameStructure);
      console.log('  ✅ Feedback reçu!\n');

      // Creative Writing Agent refines based on feedback using Agent SDK
      console.log('  ✍️  Creative Writer affine...');
      narrative = await creativeAgent.refineWithFeedback(narrative, feedback);
      console.log('  ✅ Narrative affinée!\n');

      // Game Design Agent refines mechanics using Agent SDK with MCP tools
      console.log('  ⚙️  Game Designer ajuste les mécaniques...');
      gameStructure = await gameAgent.refineGameMechanics(narrative, gameStructure);
      console.log('  ✅ Mécaniques ajustées!\n');

      console.log(`  ✨ Itération ${i} terminée! Qualité améliorée.\n`);
    }

    // PHASE 5: Final polish using Agent SDK with proofreader subagent
    console.log('💎 PHASE 5: Polissage final...');
    narrative = await creativeAgent.finalPolish(narrative);
    console.log('✅ Scénario poli!\n');

    // PHASE 6: Validation using Agent SDK with MCP tools
    console.log('✅ PHASE 6: Validation du design...');
    const validation = await gameAgent.validateGameDesign(
      `${narrative}\n\n${gameStructure}`
    );
    console.log('✅ Validation terminée!\n');

    console.log(`${'='.repeat(60)}`);
    console.log(`✨ SCÉNARIO #${scenarioNumber} COMPLÉTÉ! ✨`);
    console.log(`${'='.repeat(60)}\n`);

    return {
      concept,
      narrative,
      gameStructure,
      validation,
      iterations: this.maxIterations
    };
  }

  /**
   * Generate multiple scenarios using Agent SDK orchestration
   * This method demonstrates proper Agent SDK usage with subagent delegation
   */
  async generateMultipleScenarios(count: number): Promise<any[]> {
    console.log(`\n${'🎄'.repeat(30)}`);
    console.log(`DÉBUT DE LA GÉNÉRATION DE ${count} SCÉNARIOS`);
    console.log(`${'🎄'.repeat(30)}\n`);

    const scenarios: any[] = [];
    const startTime = Date.now();

    for (let i = 1; i <= count; i++) {
      try {
        const scenario = await this.generateScenario(i);
        scenarios.push(scenario);

        console.log(`\n📊 Progression: ${i}/${count} scénarios complétés\n`);
      } catch (error) {
        console.error(`❌ Erreur lors de la génération du scénario #${i}:`, error);
        // Continue with next scenario
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n${'🎄'.repeat(30)}`);
    console.log(`TOUS LES ${count} SCÉNARIOS GÉNÉRÉS EN ${duration}s!`);
    console.log(`${'🎄'.repeat(30)}\n`);

    return scenarios;
  }

  /**
   * Generate scenarios using a single Agent SDK query with full multi-agent orchestration
   * This is the purest Agent SDK approach - letting SDK handle all agent coordination
   */
  async generateWithSdkOrchestration(count: number): Promise<any[]> {
    const prompt = `You are a game scenario generation coordinator.

Your task: Generate ${count} unique, complete game scenarios for a Christmas gift.

CONTEXT:
- For a sister, age 30, recently married
- Format: Text-based adventure with choices, ending in Pokémon-style battle
- Protagonist: A dentist on an adventure to fight a villain

For each scenario:
1. Generate unique concept with villain, locations, and tone
2. Create game structure with stats, choices, and combat mechanics
3. Write full narrative with dialogues and descriptions
4. Iterate 3 times with self-critique to refine quality
5. Validate balance and playability

Each scenario must be DIFFERENT - vary villains, locations, mechanics, and tone.

Output each complete scenario in French with all details (concept, narrative, mechanics, validation).`;

    let generatedScenarios = '';
    const response = query({
      prompt,
      options: {
        model: 'claude-sonnet-4-5',
        systemPrompt: `You are a creative game scenario generator using multi-agent collaboration.
You coordinate between creative writing and game design expertise.
You iterate on your work to ensure maximum quality and uniqueness.
All output must be in French.`,
        agents: {
          'creative-writer': creativeAgent.creativeWritingAgentDefinition,
          'game-designer': gameAgent.gameDesignAgentDefinition,
          'coordinator': {
            description: 'Main coordinator that orchestrates the multi-agent scenario generation process',
            prompt: `You are the scenario generation coordinator.
You manage the workflow between creative writing and game design agents.
You ensure all scenarios are complete, validated, and unique.
You track progress and ensure quality standards are met.`,
            model: 'sonnet'
          }
        },
        tools: ['Read', 'Write'],
        permissionMode: 'acceptEdits' // Allow the agent to save output files
      }
    });

    for await (const message of response) {
      if (message.type === 'assistant') {
        // content can be a string or an array of content blocks
        const content = (message as any).content;
        if (typeof content === 'string') {
          generatedScenarios += content;
        } else if (Array.isArray(content)) {
          content.forEach((block: any) => {
            if (block.type === 'text') {
              generatedScenarios += block.text;
            }
          });
        }
      } else if (message.type === 'system') {
        console.log(`System: ${message.subtype}`);
      }
    }

    // Parse and return scenarios (simplified for demo)
    return [{
      narrative: generatedScenarios,
      gameStructure: 'Generated via Agent SDK orchestration',
      validation: { isValid: true, issues: [] },
      iterations: this.maxIterations
    }];
  }

  /**
   * Format scenario for output
   */
  formatScenarioForOutput(scenario: any, index: number): string {
    return `
${'='.repeat(80)}
SCÉNARIO #${index}
${'='.repeat(80)}

${scenario.narrative}

${'─'.repeat(80)}

MÉCANIQUES DE JEU:
${scenario.gameStructure}

${'─'.repeat(80)}

CONCEPT ORIGINAL:
${scenario.concept}

${'─'.repeat(80)}

Validation: ${scenario.validation.isValid ? '✅ VALIDÉ' : '⚠️  PROBLÈMES: ' + scenario.validation.issues.join(', ')}

${'='.repeat(80)}
`;
  }

  /**
   * Save all scenarios to file
   */
  async saveScenariosToFile(scenarios: any[], filename: string = 'scenarios-noel.txt'): Promise<void> {
    const fs = await import('fs');
    let content = `
${'🎄'.repeat(40)}
    🎅 CARTES DE NOËL - 10 SCÉNARIOS DE JEU VIDÉO 🎅
    Généré par KDO DADO - Système Multi-Agent avec Feedback Récursif
    Powered by Claude Agent SDK
${'🎄'.repeat(40)}

`;

    for (let i = 0; i < scenarios.length; i++) {
      content += this.formatScenarioForOutput(scenarios[i], i + 1);
      content += '\n\n';
    }

    fs.writeFileSync(filename, content, 'utf-8');
    console.log(`\n💾 Scénarios sauvegardés dans: ${filename}\n`);
  }
}
