package com.reelmonster.dialogue

enum class MonsterMood(
    val tierName: String,
    val minCount: Int,
    val maxCount: Int,
    val scaleFactor: Float,
    val description: String
) {
    HAPPY("Happy & Energetic", 0, 5, 1.0f, "Bouncing cheerfully, ready for anything!"),
    CURIOUS("Curious", 6, 10, 1.08f, "Noticing you're scrolling a bit more..."),
    SLEEPY("Sleepy", 11, 20, 1.16f, "Droopy eyes, blinking slowly with tiny yawns..."),
    TIRED("Tired & Dramatic", 21, 40, 1.25f, "Sweatdrops and deep dramatic sighs."),
    EXHAUSTED("Completely Exhausted", 41, 60, 1.34f, "Tongue out, spiraling eyes, clinging to sanity."),
    DRAMATIC("Extremely Dramatic", 61, Int.MAX_VALUE, 1.45f, "Existential comic meltdown: 'WHY ARE WE STILL HERE?!'");

    companion object {
        fun fromCount(count: Int): MonsterMood {
            return when {
                count <= 5 -> HAPPY
                count <= 10 -> CURIOUS
                count <= 20 -> SLEEPY
                count <= 40 -> TIRED
                count <= 60 -> EXHAUSTED
                else -> DRAMATIC
            }
        }
    }
}

object MonsterDialogue {

    private val tier0to5 = listOf(
        "Just one? I totally believe you.",
        "That was a quick little break!",
        "Just a taste of the algorithmic soup.",
        "Fresh and energized! Still productive.",
        "One reel never hurt anybody... right?"
    )

    private val tier6to10 = listOf(
        "Are we still taking a 'quick' break?",
        "Double digits are peeking around the corner!",
        "Curious algorithm choice right there.",
        "Wait, didn't you open this app for 30 seconds?",
        "I'm keeping my eyes wide open on you."
    )

    private val tier11to20 = listOf(
        "Your evening has officially started disappearing.",
        "*Yaaaawn*... my tiny monster eyelids are heavy.",
        "Twenty videos... that's like a whole episode of a show!",
        "Is that someone laughing, or my sleep schedule fading?",
        "Bedtime was negotiable anyway, wasn't it?"
    )

    private val tier21to40 = listOf(
        "Even I need a break now.",
        "My tiny monster legs cannot carry this much scrolling.",
        "Your to-do list just sent a missing person report.",
        "Thirty reels! Your thumb must have six-pack abs.",
        "The dopamine is flowing, but my battery is draining."
    )

    private val tier41to60 = listOf(
        "Your homework is officially filing a complaint.",
        "I have forgotten what sunlight looks like.",
        "Fifty reels! You could have learned basic conversational French.",
        "I'm melting into your screen.",
        "Are we stuck in a digital wormhole?"
    )

    private val tier61Plus = listOf(
        "Should I start charging rent on this screen?",
        "WE ARE TRANSCENDING TIME AND SPACE.",
        "At this rate, I'm taking over your phone contract.",
        "Your ancestors didn't invent agriculture for this.",
        "SEVENTY-FIVE REELS?! Call NASA, you're orbiting earth."
    )

    fun getMessageForCount(count: Int): String {
        val list = when {
            count <= 5 -> tier0to5
            count <= 10 -> tier6to10
            count <= 20 -> tier11to20
            count <= 40 -> tier21to40
            count <= 60 -> tier41to60
            else -> tier61Plus
        }
        return list.random()
    }

    fun getAllMessages(): Map<MonsterMood, List<String>> {
        return mapOf(
            MonsterMood.HAPPY to tier0to5,
            MonsterMood.CURIOUS to tier6to10,
            MonsterMood.SLEEPY to tier11to20,
            MonsterMood.TIRED to tier21to40,
            MonsterMood.EXHAUSTED to tier41to60,
            MonsterMood.DRAMATIC to tier61Plus
        )
    }
}
