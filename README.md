# Minecraft Enchanting Order Optimizer

A static GitHub Pages tool for finding efficient Minecraft anvil orders, with separate Java and Bedrock rule handling

## What does this ACTUALLY do?

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

Minecraft is a trademark of Mojang Synergies AB. This project is fan-made and is not affiliated with Mojang or Microsoft.
