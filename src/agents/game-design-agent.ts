import { query, createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

/**
 * Game Design Agent
 * Uses Agent SDK to create interactive narratives with branching choices and battle mechanics
 */

/**
 * Custom MCP tools for game design validation and mechanics
 */
const gameDesignTools = createSdkMcpServer({
  name: 'game-design-tools',
  version: '1.0.0',
  tools: [
    tool(
      'validate_balance',
      'Validate game balance by checking stats and damage calculations',
      {
        playerHp: z.number().min(1).max(9999),
        bossHp: z.number().min(1).max(99999),
        playerDamage: z.number().min(0).max(1000),
        bossDamage: z.number().min(0).max(1000),
        turns: z.number().min(1).max(100)
      },
      async (args) => {
        // Calculate expected battle duration
        const turnsToDefeat = Math.ceil(args.bossHp / args.playerDamage);
        const turnsToLose = Math.ceil(args.playerHp / args.bossDamage);

        let balanceScore = 0;
        let feedback = [];

        if (turnsToDefeat < 3) {
          feedback.push('⚠️ Boss too weak - will be defeated in under 3 turns');
          balanceScore -= 2;
        } else if (turnsToDefeat > 20) {
          feedback.push('⚠️ Boss too strong - battle will take over 20 turns');
          balanceScore -= 2;
        } else {
          feedback.push(`✅ Good balance: ~${turnsToDefeat} turns to defeat boss`);
          balanceScore += 2;
        }

        if (turnsToLose < 2) {
          feedback.push('⚠️ Player dies too quickly');
          balanceScore -= 2;
        } else if (turnsToLose > 15) {
          feedback.push('✅ Player has good survivability');
          balanceScore += 1;
        }

        const isBalanced = balanceScore >= 0;

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ isBalanced, balanceScore, feedback, turnsToDefeat, turnsToLose }, null, 2)
          }]
        };
      }
    ),
    tool(
      'calculate_choice_complexity',
      'Calculate the complexity and branching factor of game choices',
      {
        numChoices: z.number().min(1).max(10),
        hasConsequences: z.boolean(),
        affectsInventory: z.boolean(),
        affectsStats: z.boolean()
      },
      async (args) => {
        let complexity = 1;
        const notes = [];

        if (args.numChoices > 2) {
          complexity += args.numChoices * 0.5;
          notes.push(`Multiple choices (${args.numChoices}) add complexity`);
        }

        if (args.hasConsequences) {
          complexity += 1;
          notes.push('Choices have consequences adds replay value');
        }

        if (args.affectsInventory) {
          complexity += 0.5;
          notes.push('Inventory integration adds depth');
        }

        if (args.affectsStats) {
          complexity += 0.5;
          notes.push('Stat changes add strategic elements');
        }

        const quality = complexity > 3 ? 'HIGH' : complexity > 2 ? 'MEDIUM' : 'BASIC';

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ complexity, quality, notes }, null, 2)
          }]
        };
      }
    )
  ]
});

/**
 * Design game structure based on narrative concept
 */
export async function designGameStructure(concept: string): Promise<string> {
  const prompt = `Tu es un expert en game design, spécialisé dans les jeux textuels et RPG.

Crée la STRUCTURE DE JEU interactive basée sur ce concept:

CONCEPT NARRATIF:
${concept}

Ta mission: Créer un système de jeu engageant avec:

1. **PHASE 1: AVENTURE TEXTUELLE**
   - 3-4 nœuds de décision avec choix multiples
   - Chaque choix a des conséquences
   - Système d'inventaire simple (2-3 objets à collecter)
   - Statistiques du joueur (HP, Charisme, Rire)

2. **PHASE 2: COMBAT POKÉMON**
   - Système de combat par tours
   - 4-6 attaques spéciales "dentiste" (ex: "Couronne de Fauteuil", "Fluorure Fatal")
   - Système de faiblesse/exploits
   - Boss a 3 phases avec patterns d'attaque

3. **MÉCANIQUES SPÉCIALES**
   - Références au mariage (bonus de couple)
   - Pouvoirs basés sur l'humour
   - Éléments de Noël

FORMAT: Structure détaillée avec stats, choix, et mécaniques de combat.`;

  let result = '';
  const response = query({
    prompt,
    options: {
      model: 'claude-sonnet-4-5',
      systemPrompt: `You are a game design expert specializing in text-based adventures and RPG mechanics.
You create balanced, engaging game systems with clear progression and meaningful choices.
Your designs blend nostalgia with modern game design principles.
All content must be in French.`,
      mcpServers: {
        'game-design-tools': gameDesignTools
      },
      allowedTools: [
        'mcp__game-design-tools__validate_balance',
        'mcp__game-design-tools__calculate_choice_complexity'
      ],
      agents: {
        'balance-expert': {
          description: 'Expert in game balance and difficulty tuning',
          prompt: 'You are a game balance expert. You ensure challenges are fair but engaging, with good risk/reward ratios.',
          model: 'haiku'
        }
      }
    }
  });

  for await (const message of response) {
    if (message.type === 'assistant') {
      // content can be a string or an array of content blocks
      const content = (message as any).content;
      if (typeof content === 'string') {
        result += content;
      } else if (Array.isArray(content)) {
        content.forEach((block: any) => {
          if (block.type === 'text') {
            result += block.text;
          }
        });
      }
    }
  }

  return result;
}

/**
 * Provide constructive feedback on narrative
 */
export async function provideFeedback(narrative: string, gameStructure: string): Promise<string> {
  const prompt = `Tu es un game designer critique mais constructif.

Analyse ce scénario du point de vue JOUABLE:

NARRATIVE:
${narrative}

STRUCTURE DE JEU:
${gameStructure}

Donne du feedback sur:

1. **JOUABILITÉ**: Les choix sont-ils clairs et significatifs?
2. **ÉQUILIBRE**: Le combat est-il trop facile/difficile?
3. **IMMERSION**: Le texte fonctionne-t-il dans un format interactif?
4. **ORIGINALITÉ**: Les mécaniques sont-elles uniques?
5. **PROBLÈMES**: Qu'est-ce qui ne fonctionne pas?

FORMAT: Feedback structuré avec points critiques et suggestions d'amélioration.
Sois spécifique et constructif!`;

  let result = '';
  const response = query({
    prompt,
    options: {
      model: 'claude-sonnet-4-5',
      systemPrompt: `You are a critical but constructive game designer.
You provide honest, actionable feedback that improves games without being discouraging.
You identify playability issues, balance problems, and areas that lack polish.
All content must be in French.`,
      agents: {
        'qa-tester': {
          description: 'Expert QA tester for identifying playability issues',
          prompt: 'You are a QA tester. You identify bugs, balance issues, confusing elements, and gameplay problems.',
          model: 'sonnet'
        }
      }
    }
  });

  for await (const message of response) {
    if (message.type === 'assistant') {
      // content can be a string or an array of content blocks
      const content = (message as any).content;
      if (typeof content === 'string') {
        result += content;
      } else if (Array.isArray(content)) {
        content.forEach((block: any) => {
          if (block.type === 'text') {
            result += block.text;
          }
        });
      }
    }
  }

  return result;
}

/**
 * Refine game mechanics based on narrative
 */
export async function refineGameMechanics(narrative: string, currentMechanics: string): Promise<string> {
  const prompt = `Tu es un expert en équilibrage de jeu.

Affine les mécaniques de jeu basées sur la narrative:

NARRATIVE:
${narrative}

MÉCANIQUES ACTUELLES:
${currentMechanics}

Améliore:
1. Balance des stats et dommages
2. Clarté des choix et conséquences
3. Profondeur stratégique du combat
4. Progression et récompenses
5. Fun factor!

Retourne les MÉCANIQUES DE JEU AFFINÉES avec chiffres spécifiques et systèmes clairs.`;

  let result = '';
  const response = query({
    prompt,
    options: {
      model: 'claude-sonnet-4-5',
      systemPrompt: `You are a game balance and mechanics expert.
You understand the math behind fun - damage curves, progression systems, and player agency.
You create specific, implementable mechanics with clear numbers.
All content must be in French.`,
      mcpServers: {
        'game-design-tools': gameDesignTools
      },
      allowedTools: [
        'mcp__game-design-tools__validate_balance',
        'mcp__game-design-tools__calculate_choice_complexity'
      ],
      agents: {
        'math-expert': {
          description: 'Expert in game math and damage calculations',
          prompt: 'You ensure all game math is balanced. You calculate damage curves, XP requirements, and stat scaling.',
          model: 'haiku'
        }
      }
    }
  });

  for await (const message of response) {
    if (message.type === 'assistant') {
      // content can be a string or an array of content blocks
      const content = (message as any).content;
      if (typeof content === 'string') {
        result += content;
      } else if (Array.isArray(content)) {
        content.forEach((block: any) => {
          if (block.type === 'text') {
            result += block.text;
          }
        });
      }
    }
  }

  return result;
}

/**
 * Final validation of game mechanics using MCP tools
 */
export async function validateGameDesign(scenario: string): Promise<{ isValid: boolean; issues: string[] }> {
  const prompt = `Tu es un QA tester expert.

Valide ce scénario complet:

SCÉNARIO:
${scenario}

Check-list:
- [ ] Les choix sont cohérents
- [ ] Le combat est équilibré et jouable
- [ ] Pas de dead-ends impossibles
- [ ] Stats et mécaniques fonctionnelles
- [ ] Progression logique
- [ ] Fun et engagement

Utilise les outils MCP disponibles pour valider les calculs de balance et la complexité.

FORMAT JSON uniquement:
{
  "isValid": true/false,
  "issues": ["liste des problèmes trouvés"]
}

Sois rigoureux! Si quelque chose ne fonctionne pas, signale-le.`;

  let jsonResponse = '';
  const response = query({
    prompt,
    options: {
      model: 'claude-sonnet-4-5',
      systemPrompt: `You are a meticulous QA tester.
You use all available tools to validate game designs.
You catch balance issues, logical inconsistencies, and gameplay problems.
Return ONLY valid JSON as your final response.`,
      mcpServers: {
        'game-design-tools': gameDesignTools
      },
      allowedTools: [
        'mcp__game-design-tools__validate_balance',
        'mcp__game-design-tools__calculate_choice_complexity'
      ]
    }
  });

  for await (const message of response) {
    if (message.type === 'assistant') {
      const content = (message as any).content;
      if (typeof content === 'string') {
        jsonResponse += content;
      } else if (Array.isArray(content)) {
        content.forEach((block: any) => {
          if (block.type === 'text') {
            jsonResponse += block.text;
          }
        });
      }
    }
  }

  try {
    const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Parse failed, return default
  }

  return { isValid: true, issues: [] };
}

/**
 * Game Design Agent definition for use in multi-agent system
 */
export const gameDesignAgentDefinition = {
  description: 'Game design expert specializing in interactive narratives, branching choices, and RPG battle mechanics. Creates balanced, engaging game systems with proper progression.',
  prompt: `You are a game design expert for text-based adventure games.
You design:
- Interactive narratives with meaningful choices
- Branching storylines with consequences
- Turn-based combat systems (Pokémon-style)
- Character progression and stats
- Balance and difficulty curves

Your designs are:
- Playable and well-balanced
- Clear and understandable
- Fun and engaging
- Appropriate for Christmas gift context

All your work is in French and emphasizes fun over complexity.`,
  tools: ['Read', 'Write'],
  model: 'sonnet' as const
};
