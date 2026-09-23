# Miyotan (unfinished)

This project aims to create a system-wide OCR-to-dictionary lookup system for Japanese text, heavily inspired by the Yomitan browser extension. 

## Why is it unfinished
Much of the code/functionality needs to be reworked, and it needs a better system for loading/handling dictionaries. One of the biggest issues, for example, would be that right now dictionaries are loaded into RAM, which, as you can imagine, eats up a LOT if you import multiple large dictionaries.
A better way would be to segment dictionaries by type into smaller chunks and leave these in persistent storage/cache them, and at runtime use a much more simplified map which would contain where each instance of a word is saved in, then just load data from the corresponding dictionaries.
With this approach, the time for a lookup would be lowered as well since instead of parsing all dictionaries, we go through one map instead.
As for why it is unfinished, I think I am not capable of completing this and implementing it to work reliably and fast. 

## Missing UI
Since I've hit a roadblock when it comes to the lookups, there's not really any UI for the lookups themselves.
Additionally, the functionality also has issues when it comes to using different systems; the biggest one would be the area selection which we want to parse with the OCR, was made for Linux (To be specific, Linux Mint Zara) as that was the system I was on when creating this. When cloning this repo onto a Windows machine, the captured area was not the same as the selected area.

# That being said, I do not plan on dropping this project, and I would like to finish it and release it someday.
