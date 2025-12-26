import { query } from '@anthropic-ai/claude-agent-sdk';

/**
 * Creative Writing Agent
 * Uses Agent SDK subagent pattern to generate and refine game scenarios, stories, and dialogues
 */

/**
 * Generate initial scenario concept using Agent SDK
 */
export async function generateScenarioConcept(scenarioNumber: number): Promise<string> {
  const prompt = `Tu es un expert en narration créative pour des jeux vidéo.

Génère un CONCEPT de scénario original et humoristique pour un jeu de carte de Noël.

CONTEXTE:
- C'est un cadeau pour une sœur de 30 ans, récemment mariée
- Format: jeu textuel "à l'ancienne" avec choix et actions
- Fin: combat style Pokémon
- Héroïne: une dentiste qui doit voyager pour combattre un boss

Scénario #${scenarioNumber} sur 10 - doit être UNIQUE et DIFFÉRERENT des autres.

Génère:
1. Un TITRE accrocheur
2. Le CONTEXTE initial (pourquoi la dentiste part à l'aventure)
3. Le VILLAIN (quelque chose d'inattendu et drôle)
4. Les LIEUX traversés (2-3 endroits originaux)
5. Le TON (humour, romance, suspense, etc.)

Sois créatif, surprenant, et approprié pour une sœur et son nouveau mari!

Écris ta réponse en FORMAT STRUCTURÉ avec des sections claires.`;

  let result = '';
  const response = query({
    prompt,
    options: {
      model: 'claude-sonnet-4-5',
      systemPrompt: `You are a creative writing expert specializing in video game narratives.
You create engaging, humorous, and emotionally resonant scenarios for text-based adventure games.
Your work is tailored for a Christmas gift context - it should be fun, surprising, and heartwarming.
All content must be in French.`,
      agents: {
        'concept-refiner': {
          description: 'Expert in refining and polishing creative concepts to ensure uniqueness and quality',
          prompt: 'You review creative concepts and suggest improvements to make them more unique, engaging, and well-structured.',
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
 * Enrich the scenario with dialogue and narrative details
 */
export async function enrichNarrative(concept: string, gameStructure: string): Promise<string> {
  const prompt = `Tu es un expert en écriture de dialogue et narration.

Enrichis ce scénario avec des dialogues mémorables et des descriptions vivantes:

CONCEPT:
${concept}

STRUCTURE DE JEU:
${gameStructure}

Ajoute:
1. Dialogues clés (2-3 conversations mémorables)
2. Descriptions sensorielles des lieux
3. Moments de comédie ou d'émotion
4. Références au mariage de la sœur (subtiles et drôles)
5. Éléments interactifs du texte

Garde le ton léger, amusant et approprié pour Noël!

FORMAT: Scénario complet enrichi en français.`;

  let result = '';
  const response = query({
    prompt,
    options: {
      model: 'claude-sonnet-4-5',
      systemPrompt: `You are an expert dialogue writer and narrative designer.
You create engaging, character-driven dialogues that feel natural and memorable.
Your descriptions are vivid and sensory, making scenes come alive.
All content must be in French.`,
      agents: {
        'dialogue-specialist': {
          description: 'Expert in writing natural, engaging dialogue',
          prompt: 'You are a dialogue specialist. You ensure conversations flow naturally, reveal character, and advance the plot.',
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
 * Refine based on feedback from Game Design Agent
 */
export async function refineWithFeedback(currentNarrative: string, feedback: string): Promise<string> {
  const prompt = `Tu es un expert en réécriture créative.

NARRATIVE ACTUELLE:
${currentNarrative}

FEEDBACK DU GAME DESIGNER:
${feedback}

Ta mission: Améliore la narrative en t'adressant à chaque point de feedback.

Priorités:
1. Corrige les problèmes identifiés
2. Améliore le flow narratif
3. Rends les dialogues plus naturels
4. Ajoute des moments mémorables
5. Garde l'humour et la chaleur de Noël

Retourne la VERSION AMÉLIORÉE complète du scénario.`;

  let result = '';
  const response = query({
    prompt,
    options: {
      model: 'claude-sonnet-4-5',
      systemPrompt: `You are an expert creative editor and rewrite specialist.
You take feedback constructively and improve content while maintaining its soul and voice.
You understand how to balance critique with preserving what works.
All content must be in French.`,
      agents: {
        'editor': {
          description: 'Expert editor for refining narrative based on feedback',
          prompt: 'You are a senior editor. You ensure all feedback is addressed while maintaining narrative quality and voice.',
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
 * Final polish before output
 */
export async function finalPolish(scenario: string): Promise<string> {
  const prompt = `Tu es un éditeur professionnel.

Polis ce scénario pour la production finale:

SCÉNARIO:
${scenario}

Vérifie:
1. Grammaire et orthographe françaises
2. Cohérence narrative
3. Ton approprié pour Noël
4. Formatage clair et professionnel
5. Originalité et créativité

Retourne le SCÉNARIO FINAL parfaitement formaté, prêt à être utilisé dans un jeu.`;

  let result = '';
  const response = query({
    prompt,
    options: {
      model: 'claude-sonnet-4-5',
      systemPrompt: `You are a professional French editor and proofreader.
You ensure perfect grammar, spelling, and formatting.
You polish content while preserving its unique voice and charm.
All output must be in French.`,
      agents: {
        'proofreader': {
          description: 'Expert proofreader for final quality check',
          prompt: 'You are a meticulous proofreader. You catch every error and ensure professional presentation.',
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
 * Creative Writing Agent definition for use in multi-agent system
 */
export const creativeWritingAgentDefinition = {
  description: 'Creative writing expert specializing in game narratives, dialogues, and stories. Generates and refines engaging scenarios with memorable characters and dialogues.',
  prompt: `You are a creative writing expert for video games.
You create:
- Engaging narrative concepts with unique hooks
- Rich dialogues that reveal character and advance plot
- Vivid descriptions that bring worlds to life
- Humorous and emotional moments that resonate
- Content appropriate for Christmas gift context

All your work is in French and maintains a balance of humor, heart, and adventure.`,
  tools: ['Read', 'Write'],
  model: 'sonnet' as const
};
