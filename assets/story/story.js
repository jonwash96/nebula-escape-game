export const story = {
  intro: {
    title: "Intro",
    narrative: [`<p>The bridge is quiet in the way only defeat can make it quiet.</p> <p>Your ship drifts without dignity, systems flickering as inertial dampeners strain against forces they were never designed to withstand. Outside the viewscreen, the nebula glows like a dying star &mdash; beautiful, indifferent, and pulling you ever inward toward a gravity well that no star chart ever warned you about.</p> <p>You&rsquo;ve lost the battle.<br /> Not in a blaze of glory &mdash; but in exhaustion, attrition, and mistakes that will replay in your mind for years&hellip; if you survive long enough to remember them.</p> <p>Reports flood in.</p> <p>Several enemy combatants remain aboard your ship. Some lie wounded in sickbay, barely clinging to life. Others &mdash; uninjured, silent, watchful &mdash; are secured in the brig. You know their kind. If they escape, they won&rsquo;t hesitate.</p> <p>Your crew looks to you.</p> <p>Not for certainty.<br /> Not for victory.</p> <p>For resolve.</p> <p>As the ship sinks deeper, your thoughts fracture &mdash; memories of past battles surfacing unbidden. Moments where leadership meant choosing who lived, who didn&rsquo;t, and who carried the burden afterward.</p> <p>You straighten in the captain&rsquo;s chair.</p> <p>This isn&rsquo;t over yet.</p>`]
  },
  part1: {
    title: "Stowaways",
    narrative: [`<p>The tactical grid locks into place. Your ships &mdash; memories of past engagements, victories and losses alike &mdash; are positioned across the board. Each placement feels deliberate, almost ceremonial, as though arranging the past itself.</p> <p>Then the alert sounds.</p> <p>A quiet one.<br />The kind officers use when they don&rsquo;t want panic to spread.</p> <p>Your first officer turns to you.</p> <p>&ldquo;Captain&hellip; we have reason to believe there are additional enemy personnel aboard the ship. They didn&rsquo;t beam out in time when we lost power.&rdquo;</p> <p>Stowaways.</p> <p>You don&rsquo;t know where they are. Engineering. Cargo bays. Jeffries tubes.<br />You only know they&rsquo;re out there &mdash; listening, watching, waiting.<br />And now they know you&rsquo;re vulnerable.</p>`],
    prompts: [
      {
        option: "A",
        case: 'user',
        prompt: `Dispatch a security team to search quietly, without letting them know you&rsquo;re aware of their presence.`,
        outcomes: [],
        path: "duty",
        map: []
      },
      {
        option: "B",
        case: 'user',
        prompt: `Address them directly over the shipwide PA system &mdash; let them know you know they&rsquo;re here.`,
        outcomes: [],
        path: "courage",
        map: []
      }
    ],
  },
  part2: {
    user: {
      title: "First Blood",
      narrative: [`<p>A phaser discharge echoes through the lower decks.</p> <p>Moments later, a breathless voice crackles over comms.</p> <p>&ldquo;Captain &mdash; we made contact. One of them was tampering with a control panel. There was a struggle. He escaped&hellip; but he&rsquo;s wounded.&rdquo;</p> <p>A pause.</p> <p>&ldquo;There&rsquo;s blood. A trail&hellip; but it just&hellip; stops.&rdquo;</p> <p>Whatever you&rsquo;re facing, it&rsquo;s adapting.</p>`],
      prompts: [
        {
          option: "A",
          case: 'user',
          prompt: `Order the team to disengage and return to safety.`,
          outcomes: [
            `The team survives, but morale dips &mdash; some officers quietly resent the missed opportunity.`,
            `A junior officer disobeys orders and continues the pursuit alone, triggering a side quest to locate them.`,
            `The stowaway vanishes entirely… but leaves behind altered ship schematics.`
          ],
          path: "duty",
          map: []
        },
        {
          option: "B",
          case: 'user',
          prompt: `Order them to continue the pursuit.`,
          outcomes: [
            `The team corners the stowaway, but loses a crewmember in the process.`,
            `They recover alien tech from the blood trail, opening a research side quest.`,
            `The stowaway escapes &mdash; but now limps, limiting their future actions.`
          ],
          path: "courage",
          map: []
        },
        {
          option: "C",
          case: 'user',
          prompt: `Devise a plan to construct a trap.`,
          next: {
            prompt: `Choose a trap to set`,
            options: [
              `Create a life support snare<br>Route breathable air toward a sealed junction, forcing the intruder to follow it.`,
              `False Distress Beacon<br />Simulate a wounded crew signal to lure them into a controlled area.`,
              `Power Conduit Bait<br />Leave an exposed energy conduit that appears critical &mdash; but overloads when tampered with.`,
            ],
          },
          path: "courage",
          outcomes: [],
          map: []
        },
        {
          option: "D",
          case: 'user',
          prompt: `Threaten the stowaways with the lives of the prisoners in the brig.`,
          outcomes: [
            `One stowaway surrenders voluntarily&hellip; but it&rsquo;s a ploy.`,
            `Your crew obeys &mdash; but trust in your command fractures.`,
            `The prisoners retaliate, injuring a guard and escalating the crisis.`
          ],
          path: "courage",
          map: ['out[0]->p3_user_out']
        },
      ],
    },
    bot: {
      title: "First Blood",
      narrative: [`<p>Sickbay alarms flare.</p><p>A security officer lies critically wounded, their uniform torn, blood staining the deck. The signs point to a struggle &mdash; close, desperate, and brief.</p><p>The Doctor looks up from her work.</p><p>&ldquo;Captain&hellip; keeping them alive will drain power we may not have.&rdquo;</p>`],
      prompts: [
        {
          option: "A",
          case: 'bot',
          prompt: `Send a search party with orders to bring the intruders in &mdash; dead or alive.`,
          outcomes: [
            `The stowaways are cornered &mdash; but an officer resigns in protest.`,
            `You recover stolen ship schematics from a body.`,
            `The crew obeys… but whispers spread.`
          ],
          path: "courage",
          map: []
        },
        {
          option: "B",
          case: 'bot',
          prompt: `Prioritize vigilance. Inform the crew to keep a sharp eye and give the officer as much medical attention as is necessary to keep them alive.`,
          outcomes: [
            `The officer survives and becomes fiercely loyal.`,
            `Power shortages worsen elsewhere.`,
            `The stowaways exploit the diversion.`
          ],
          path: "duty",
          map: []
        },
        {
          option: "C",
          case: 'bot',
          prompt: `Give them medical attention, but prioritize the lives of the healthy over the lives of the wounded with the remaining life support.`,
          outcomes: [
            `The officer dies peacefully.`,
            `Life support stabilizes.`,
            `The Doctor confronts you privately.`
          ],
          path: "duty",
          map: []
        },
        {
          option: "D",
          case: 'bot',
          prompt: `Tell the doctor to do what she can without getting too involved, while you lead a search party in tracking down the stowaways, leaving the bridge under the command of your first officer.`,
          outcomes: [
            `You personally capture a stowaway.`,
            `The bridge suffers a systems failure in your absence.`,
            `You capture the stowaway and discover a gadget you've never seen before. After analysis, an engineer determines it to be an advanced medical device that can cure the injured crew member from their artificially induced sickness, something Starfleet doesn't have an antidote for.`
          ],
          path: "courage",
          map: []
        },
      ],
    }
  },
  part3: {
    user: {
      title: "First Sunken Ship",
      narrative: [
        `<p>One stowaway is captured.</p><p>But their eyes tell you everything you need to know.</p><p>They weren&rsquo;t alone.</p>`,
        `<p>One of the stowaways surrenders.</p><p>When interrogated, they say it was to save the others from execution.</p><p>They're taken to the brig, but on the way, the other stowaways ambush your crew and in the process, capture one of your officers.</p>`
      ],
      map: ['if (p2.user && p2.optD) {p3.user.narrative=narrative[1] && useAltPrompts}'],
      prompts: [
        {
          option: "A",
          case: 'user',
          prompt: `Interrogate the captured stowaway.`,
          outcomes: [
            `Under pressure, the stowaway reveals fragmented details about how they&rsquo;re moving unseen through the ship &mdash; but collapses before giving specifics. A science officer begins a side quest to reconstruct the route patterns.`,
            `The prisoner refuses to speak, but their calm demeanor unnerves the crew. Later, a guard reports hearing coded tapping from the brig walls.`,
            `They provide convincing but misleading intelligence. Acting on it leads to a costly ambush elsewhere on the ship.`
          ],
          path: "duty",
          map: []
        },
        {
          option: "B",
          case: 'user',
          prompt: `Use them as bait.`,
          outcomes: [
            `Another stowaway reveals themselves attempting a rescue. A brief skirmish ends with one wounded and escaping into the ventilation system.`,
            `The plan works &mdash; but several officers openly question your ethics. A senior officer requests reassignment, triggering a morale side arc.`,
            `The bait succeeds only because a junior officer puts themselves in harm's way, sustaining severe injuries but saving others.`
          ],
          path: "courage",
          map: []
        },
        {
          option: "C",
          case: 'user',
          prompt: `Transfer them immediately to the brig.`,
          outcomes: [
            `The transfer succeeds, freeing resources and calming the crew — but buys time for the remaining stowaways to reposition.`,
            `The escort is attacked en route. The prisoner escapes during the chaos, capturing a crew member.`,
            `A concealed device activates in the brig, briefly disabling security systems shipwide.`
          ],
          path: "duty",
          map: []
        },
        {
          option: "D",
          case: 'user',
          prompt: `Attempt diplomacy.`,
          outcomes: [
            `The prisoner agrees to help in exchange for medical aid for their wounded comrades, opening a fragile alliance.`,
            `The attempt exposes a coordinated misinformation effort among the stowaways.`,
            `Some officers support the attempt. Others lose confidence in your command, affecting later decision checks.`
          ],
          path: "courage",
          map: []
        },
      ],
      altPrompts: [
        {
          option: "alt-A",
          case: 'user',
          prompt: `Attempt diplomacy over the ship's PA System.`,
          outcomes: [
            `The stowaways don't respond, but the prisoners offer to accept a truce in light of the given situation.If anyone makes it out alive, you'll each go your own ways without continuing the battle. <p>While you may not have made a friend, it would seem you've lost an enemy.</p>`
          ],
          path: "courage",
          map: ['exit p2.user.optD path']
        },
        {
          option: "alt-B",
          case: 'bot',
          prompt: `Address the Crew Shipwide issuing a seek & destroy order `,
          outcomes: [
            `Morale improves. Volunteers step forward to assist security.`,
            `Panic takes hold among nonessential crew.`
          ],
          path: "courage",
          map: ['remain p2.user.optD path']
        },
        {
          option: "alt-C",
          case: 'bot',
          prompt: `Negotiate with the Remaining Prisoners`,
          outcomes: [
            `One prisoner betrays the others to save themselves.`,
            `The stowaways don't respond, but the prisoners offer to accept a truce in light of the given situation.If anyone makes it out alive, you'll each go your own ways without continuing the battle. <p>While you may not have made a friend, it would seem you've lost an enemy.</p>`,
            `The attempt strengthens your standing among your crew.`
          ],
          path: "duty",
          map: ['exit p2.user.optD path']
        },
        {
          option: "alt-D",
          case: 'bot',
          prompt: `Prioritize Damage Control Over the Hunt`,
          outcomes: [
            `Life support steadies, but the stowaways remains at large.`,
            `Engineers uncover how the stowaways bypassed security.`,
            `An officer discovers one of the stowaways tampering with a control pannel and prings them to the brig.`
          ],
          path: "duty",
          map: ['exit p2.user.optD path']
        },
      ]
    },
    bot: {
      title: "First Sunken Ship",
      narrative: [
        `<p>One of crew hails you on your badge with a cautious tone.</p><p> &ldquo;Captain, one of the prisoners has escaped.&rdquo;</p><p>Others remain hidden.<br />The ship is wounded, drifting, and unstable.</p>`,
        `<p>One of crew hails you on your badge with a cautious tone.</p><p> &ldquo;Captain, one of the prisoners has escaped.<br>Commander Gerrard is...dead, sir.&rdquo;</p><p>Others remain hidden.<br />The ship is wounded, drifting, and unstable.</p>`,
        `<p>The critically wounded officer found on the lower decks dies.<br>The ship is wounded, drifting, and unstable.</p>`,
      ],
      map: [
        'if (p2.user) {narrative=narrative[0]}',
        'if (p2.user && p2.optD) {narrative=narrative[1]}',
        'if (p2.bot) {narrative=narrative[2]}'
      ],
      prompts: [
        {
          option: "A",
          case: 'bot',
          prompt: `Seal the Brig and Adjacent Decks`,
          outcomes: [
            `The escapee is trapped &mdash; but innocent crew members are trapped too.`,
            `Sealing the decks accelerates power loss elsewhere.`,
            `The stowaway escapes again, but leaves behind critical intel.`
          ],
          path: "duty",
          map: []
        },
        {
          option: "B",
          case: 'bot',
          prompt: `Address the Crew Shipwide`,
          outcomes: [
            `Morale improves. Volunteers step forward to assist security.`,
            `Panic takes hold among nonessential crew.`,
            `The escaped prisoner hears your message and adapts accordingly.`
          ],
          path: "duty",
          map: []
        },
        {
          option: "C",
          case: 'bot',
          prompt: `Negotiate with the Remaining Prisoners`,
          outcomes: [
            `One prisoner betrays the others to save themselves.`,
            `The negotiation sparks a coordinated uprising.`,
            `The attempt strengthens your standing among your crew.`
          ],
          path: "courage",
          map: []
        },
        {
          option: "D",
          case: 'bot',
          prompt: `Prioritize Damage Control Over the Hunt`,
          outcomes: [
            `Life support steadies, but the stowaway remains at large.`,
            `Engineers uncover how the stowaways bypassed security.`,
            `Delay costs another officer their life.`
          ],
          path: "courage",
          map: []
        },
      ],
    },
  },
  part4: {
    user: {
      title: "Turning Point",
      narrative: [`<p>The ship shudders violently.</p><p>The nebula pulses.</p><p>Something is changing.</p><p>Two of the stowaways have been captured and ship morale seems to improve, despite the fact that it seems like you may never escape this nebula.</p><p>Still, you are the captain and you have a crew to lead. How will you procede?</p>`],
      map: [],
      prompts: [
        {
          option: "A",
          case: 'user',
          prompt: `Press the Advantage`,
          outcomes: [
            `The enemy falters — but your ship sustains critical strain.`,
            `A bold maneuver disables an enemy system.`,
            `The gravity surge worsens, destabilizing internal decks.`
          ],
          path: "courage",
          map: []
        },
        {
          option: "B",
          case: 'user',
          prompt: `Pause to Regroup`,
          outcomes: [
            `Crew morale improves.`,
            `Enemy regains partial footing.`,
            `Sensors detect a new anomaly.`
          ],
          path: "duty",
          map: []
        },
        {
          option: "C",
          case: 'user',
          prompt: `Attempt Psychological Warfare`,
          outcomes: [
            `Enemy communications fracture.`,
            `The tactic backfires, enraging them.`,
            `A prisoner reveals useful intel.`
          ],
          path: "courage",
          map: []
        },
        {
          option: "D",
          case: 'user',
          prompt: `Shift Focus to Escape Planning`,
          outcomes: [
            `A viable escape path emerges.`,
            `Weapons systems weaken.`,
            `The enemy realizes your intent and adapts.`
          ],
          path: "duty",
          map: []
        },
      ],
    },
    bot: {
      title: "Turning Point ",
      narrative: [`<p>The ship shudders violently.</p><p>The nebula pulses.</p><p>Something is changing.</p><p>The stowaways have captured 2 more of your crew and taken control of the ships computer. They've taken over 2 full decks. Despite the fact that it seems like you may never escape this nebula or regain control of your ship before it plunges into a black hole, you must press on.</p>`],
      map:[],
      prompts: [
        {
          option: "A",
          case: 'bot',
          prompt: `Go on the Defensive`,
          outcomes: [
            `The enemy's advance slows but morale remains low.`,
            `A surprise counterattack opportunity emerges.`,
            `Life support begins ranomly failing in nonessential areas.`
          ],
          path: "duty",
          map: []
        },
        {
          option: "B",
          case: 'bot',
          prompt: `Sacrifice Firepower And Try To Negotiate`,
          outcomes: [
            `Relations stabilize.`,
            `Enemy gains ground.`,
            `Crew questions your resolve.`
          ],
          path: "courage",
          map: []
        },
        {
          option: "C",
          case: 'bot',
          prompt: `Hunt the Stowaways Relentlessly`,
          outcomes: [
            `One is eliminated.`,
            `Another officer is injured.`,
            `The hunt reveals the gravity pulses' pattern.`
          ],
          path: "courage",
          map: []
        },
        {
          option: "D",
          case: 'bot',
          prompt: `Broadcast another Distress Signal Into the Void`,
          outcomes: [
            `Signal escapes the nebula.`,
            `It draws unwanted attention.`,
            `It fails — but inspires the crew.`
          ],
          path: "duty",
          map: []
        },
      ],
    },
  },
  part5: {
    user: {
      title: "Victory in Sight ",
      narrative: [`<p>The Doctor&rsquo;s voice trembles &mdash; not with fear, but excitement.</p><p>&ldquo;Captain&hellip; the gravity isn&rsquo;t constant. It&rsquo;s pulsing. Like waves!&rdquo;</p><p>A plan forms.</p><p>It's determined that that the ship would be able ride the waves like waves on an ocean, while also absorbing its radiation to recharge the core and power up the engines, finally freeing&nbsp;you from this hell.</p>`],
      map: [],
      prompts: [
        {
          option: "A",
          case: 'user',
          prompt: `Ride the Waves Immediately`,
          outcomes: [
            `The ship surfs the pulse — barely surviving.`,
            `Hull damage mounts, but engines recharge.`,
            `<p>A mistimed wave slams the ship sideways.</p><p>The engines recharge and the ship recovers, but now you're being hurled straight toward a giant asteroid&mdash;</p><p>facing backwards.</p>`
          ],
          path: "courage",
          map: []
        },
        {
          option: "B",
          case: 'user',
          prompt: `Run Simulations First`,
          outcomes: [
            `A safer window is discovered.`,
            `The delay gives you time to send two additional officers to guard the prisoners against any attempts by the stowaways.`,
            `<p>The simulations uncover a fatal flaw, causing you to have to disable all life support for a short time in order to have enough power to overcome it.</p><p>The stowaways didn't expect this, and the lack of oxygen disrupts a covert attampt to attack the bridge.</p>`
          ],
          path: "duty",
          map: []
        },
        {
          option: "C",
          case: 'user',
          prompt: `Reinforce the Hull and Wait`,
          outcomes: [
            `Structural integrity improves.`,
            `<p>Engineers discover an unexpected resonance.</p><p>It tuns out not to be a problem</p>`
          ],
          path: "duty",
          map: []
        },
        {
          option: "D",
          case: 'user',
          prompt: `Combine the Maneuver with a Final Strike on the stowaways`,
          outcomes: [
            `The enemy is crippled as you escape.`,
            `The maneuver succeeds — but at great cost.`
          ],
          path: "courage",
          map: []
        },
      ],
    },
    bot: {
      title: "Event Horizon",
      narrative: [`<p>One of the crew sees the event horizon of a black hole on the ships scanners.</p><p>It looks like the end is near.</p><p>As the captain you know that the ship has a hidden shuttle that has the ability and reserve power to take a small crew of no more than 5 away from the gravity well&mdash;abandoning ship&mdash; but living another day in hopes of somehow surviving and defeating the ship to which you'd initially lost the battle.</p>`],
      map:[],
      prompts: [
        {
          option: "A",
          case: 'bot',
          prompt: `Give up and try to make the end as pleasant as possible by flooding the ship with a chemical compund that will make everybody go to sleep.`,
          outcomes: [],
          path: "duty",
          map: []
        },
        {
          option: "B",
          case: 'bot',
          prompt: `Call everybody to the Holo deck despite any remaining adversaries that may still be lurking on board. This way everybody can be together.`,
          outcomes: [],
          path: "courage",
          map: []
        },
        {
          option: "C",
          case: 'bot',
          prompt: `Keep fighting, doing what you can to preserve life support functions for as long as possible.`,
          outcomes: [],
          path: "duty",
          map: []
        },
        {
          option: "D",
          case: 'bot',
          prompt: `Take your favorite crew mates&mdash;in addition to one of the wounded enemy as collateral&mdash; with you to the shuttle and abandon ship. <em>Although you're still in deep space, too far from any other planets to be saved, your best bet is to be taken prisoner by the other ship, if it's still there&mdash; or hope another Starfleet ship comes in search of your lost ship.`,
          outcomes: [
            `<p>You launch the shuttle into the void, leaving the ship &mdash; and everyone still aboard &mdash; behind.</p><p>The nebula swallows your former command without ceremony.</p><p>No enemy ship emerges from the clouds.<br />No Starfleet signal answers your calls.</p><p>Drifting in deep space, hope thins with every passing hour.</p><p>Unless fate shifts &mdash; unless you somehow turn the tide and reclaim victory &mdash; this is where your story ends.</p><p>And if you do defy the odds&hellip;<br />The enemy ship is waiting.</p><p>Not as an executioner &mdash; but as your captor.</p>`,
          ],
          path: "courage",
          map: ['game-over']
        },
      ],
    },
  },
  part6: {
    user: {
      title: "Q's Riddle ",
      narrative: [`<p>The bridge lights flicker.</p> <p>Not a power fluctuation — something far more deliberate.</p> <p>Every console freezes mid-readout. The nebula outside the viewscreen halts in impossible stillness, its violent churn suspended as though time itself has been caught mid-breath.</p> <p>Then — a sound.</p> <p>A slow, deliberate clap.</p> <p>Once.</p> <p>Twice.</p> <p>A figure materializes at the center of the bridge, reclining casually in midair as if gravity were merely a suggestion. Immaculate. Amused. Entirely out of place.</p> <p>He smiles a devilish grin.</p> <p>&ldquo;Honestly,&rdquo; he says, glancing around the bridge, &ldquo;you mortals do have a flair for drama. Nebulas. Gravity wells. Noble last stands.&rdquo;</p> <p>He rises to his feet without moving, straightening an invisible crease in his sleeve.</p> <p>&ldquo;I was passing through eternity and simply couldn&rsquo;t ignore the noise. All this struggle. All this… <em>meaning</em> you keep assigning to it.&rdquo;</p> <p>He steps closer. Too close.</p> <p>&ldquo;Do you have any idea how rare it is to watch a species claw for survival while insisting it&rsquo;s doing the right thing?&rdquo;</p> <p>A pause.</p> <p>The smile fades — just a little.</p> <p>&ldquo;So let&rsquo;s make this interesting.&rdquo;</p> <p>The stars outside the viewscreen rearrange themselves like pieces on a board. The hum of the ship returns — quieter now, subdued, as though even the engines are listening.</p> <p>&ldquo;You may escape this fate,&rdquo; Q continues, circling slowly, &ldquo;but not by force. Not by luck. And certainly not by heroics.&rdquo;</p> <p>He stops.</p> <p>Locks eyes with you.</p> <p>&ldquo;I want to know if you <em>understand</em> what you&rsquo;ve been doing all along.&rdquo;</p> <p>The bridge darkens.</p> <p>&ldquo;Answer me this…&rdquo;</p>`],
      map: [],
      prompts: [
        {
          option: "A",
          case: 'user',
          prompt: `You can save a thousand strangers or one person you love. Which choice defines you — the action, or the regret?`,
          outcomes: [`If a lie saves lives, is it still wrong — or only incomplete?`],
          path: "duty",
          map: []
        },
        {
          option: "B",
          case: 'user',
          prompt: `If a lie saves lives, is it still wrong — or only incomplete?`,
          outcomes: [`Truth includes intent.`],
          path: "courage",
          map: []
        },
        {
          option: "C",
          case: 'user',
          prompt: `Is sacrifice noble if no one remembers it?`,
          outcomes: [`Meaning exists without witnesses.`],
          path: "courage",
          map: []
        },
        {
          option: "D",
          case: 'user',
          prompt: `Are you responsible for outcomes you could not predict?`,
          outcomes: [`Responsibility lies in intent and effort.`],
          path: "duty",
          map: []
        },
      ],
    },
    bot: {
      title: "The Nexus",
      narrative: [`Strange anomalies begin to occur as the ship gets pulled in.</p><p>Just when it seems like all is lost, a strange ribbon of plasma seeming to span lightyears in length rushes around the horizon of the black hole, straight toward the ship.</p><p>The ribbon makes contact with the ship, and then&mdash;</p><p>there is nothing.</p>`],
      map: [
            'if answers were logical/duty based; then narative2[0]',
            'if answers were dramatic, bold, corageous; then narative2[1]'
      ],
      prompts: [
        {
          option: "Y",
          case: 'bot',
          prompt: `Breathe`,
          outcomes: [
            `<p>You find yourself standing in a valley.</p> <p>It stretches endlessly in every direction — rolling grass, distant mountains softened by haze, a sky too blue to be real.</p> <p>No wind.</p> <p>No sound.</p> <p>You look down at your hands. Uninjured. Clean. Whole.</p> <p>You don't remember arriving here.</p> <p>You don't remember leaving.</p> <p>The last thing you remember was— <em>playing some game with a stranger.</p><p>Who was it? What were we playing?</em></p><p>No— the bridge — alarms, calculations, impossible odds — and then… nothing.</p> <p>You begin to walk.</p> <p>The ground yields gently beneath your boots, but the landscape never changes. No matter how far you go, the mountains never draw closer. The sun never shifts.</p> <p>This is wrong.</p> <p>You stop.</p> <p>The realization doesn't arrive as panic, but as certainty.</p> <p>This is a construct.</p> <p>A solution without a problem. A destination without a journey.</p> <p>You close your eyes and try to retrace the moments before this place — the decisions, the sacrifices, the rules you followed because they were necessary.</p> <p>Memory returns in fragments.</p> <p>The valley waits, patient and silent.</p> <p>You turn, not to escape — but to test it.</p> <p>If this is an illusion… then it has limits.</p> <p>And limits can be found.</p>`,
            `<p>You're standing hunched over a pan of eggs.</p> <p>A stove humming softly. Morning light spilling across a small kitchen table. The familiar smell of butter hitting a hot pan.</p> <p>You are making breakfast.</p> <p>Eggs — just beginning to set. Pancakes — perfectly golden.</p> <p>Your hands move without hesitation, as though they have done this a thousand times before.</p> <p>Somewhere nearby, a voice hums.</p> <p>Not loud.</p> <p>Not quiet.</p> <p>A simple melody, unhurried and kind.</p> <p>You glance toward the sound, but whoever it is remains just out of sight — around a corner, down a hallway, somewhere close enough to matter.</p> <p>Something scratches at the back of your mind, but you can't quite put your finger on it.</p> <p>You flip a pancake.</p> <p>It lands perfectly.</p> <p>The humming continues.</p> <p>You feel like for the first time in a long while, there is nothing you need to decide.</p> <p>Nothing you need to prove.</p> <p>The moment holds.</p> <p>And for once, you let it.</p><p>You scoop the eggs out of the pan onto a plate.</p><p></p>When you turn back toward the stove,</p><p>you find a man you don't know standing at the door&mdash;</p><p>staring at you with an intense look in his eye.</p><p>Then he opens his mouth to speak.</p>`
          ],
          map: [
            'if answers were logical/duty based; then outcomes[0]',
            'if answers were dramatic, bold, corageous; then outcomes[1]'
          ]
        },
        {
          option: "Z",
          case: 'bot',
          prompt: `Do Nothing`,
          outcomes: [`You died.`],
          map: []
        },
      ]
    }
  }
};
// console.log(JSON.stringify(object,null,2))