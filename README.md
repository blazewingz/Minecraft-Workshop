# Minecraft Enchanting Order Optimizer

A static GitHub Pages tool for finding efficient Minecraft anvil orders, with separate Java and Bedrock rule handling.

## Deploy to GitHub Pages

1. Put the contents of this folder in the root of a GitHub repository.
2. In GitHub, open **Settings → Pages**.
3. Set the source to **Deploy from a branch**, choose your main branch, and choose `/ (root)`.
4. Save. GitHub Pages should serve `index.html` directly.

There is no build step and no backend.

## What this first version does

- Java Edition and Bedrock Edition are switchable.
- Calculates prior-work penalties as `2^n - 1`.
- Uses Java's 39-level Survival/Adventure anvil cap.
- Uses Bedrock's level-increase enchantment charging model and does not apply the Java 39-level cap.
- Handles book-to-book merges and book-to-target merges.
- Handles equal-level enchantment upgrades, higher/lower level transfers, incompatible enchantments, and item applicability.
- Searches the exact merge tree for up to 8 enchanted books.
- Two objectives: **Least XP spent** and **Lowest final work penalty**.

## Important scope notes

This is intentionally focused on enchantment ordering. It does not yet model durability repair, material repair, renaming, damaged-item states, or arbitrary item-to-item equipment sacrifices. Those can be added to the same simulation engine without changing the page architecture.

The current data includes the modern vanilla enchantments represented by the planner, including the spear's Lunge enchantment and the mace's Density, Breach, and Wind Burst.

## Mechanics references used while building this version

- Minecraft Wiki mirror, **Anvil mechanics**: https://theminecraftwiki.com/wiki/anvil-mechanics/
- Mojang / Minecraft Feedback, **Java Edition 1.21.11** spear details: https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21-11
- Mojang / Minecraft Feedback, **Bedrock Edition 1.21.130** spear details: https://feedback.minecraft.net/hc/en-us/articles/41446685014669-Minecraft-Bedrock-Edition-1-21-130-Mounts-of-Mayhem

Minecraft is a trademark of Mojang Synergies AB. This project is fan-made and is not affiliated with Mojang or Microsoft.
