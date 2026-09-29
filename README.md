# Miyotan (unfinished)

This project aims to create a system-wide OCR-to-dictionary lookup system for Japanese text, heavily inspired by the Yomitan browser extension. 

## Why is it unfinished
Much of the code/functionality needs to be reworked, and it needs a better system for loading/handling dictionaries. One of the biggest issues, for example, would be that right now dictionaries are loaded into RAM, which, as you can imagine, eats up a LOT if you import multiple large dictionaries.
A better way would be to segment dictionaries by type into smaller chunks and leave these in persistent storage/cache them, and at runtime use a much more simplified map which would contain where each instance of a word is saved in, then just load data from the corresponding dictionaries.
With this approach, the time for a lookup would be lowered as well since instead of parsing all dictionaries, we go through one map instead.
As for why it is unfinished, I think I am not capable of completing this and implementing it to work reliably and fast. 

## Missing UI
Since I've hit a roadblock when it comes to the lookups, there's not really any UI for the lookups themselves.
Additionally, the functionality also has issues when it comes to using different systems; the biggest one would be the area selection which we want to parse with the OCR, was made for Linux (To be specific, Linux Mint Zara), as that was the system I was on when creating this. When cloning this repo onto a Windows machine, the captured area was not the same as the selected area.

### That being said, I do not plan on dropping this project, and I would like to finish it and release it someday.

## APP PREVIEW:

### App (settings/controls)
<img width="1291" height="849" alt="image" src="https://github.com/user-attachments/assets/2198fa31-a3b1-41ba-9e53-ebe9e4c7d0b9" />

### Dictionary view
<img width="1281" height="846" alt="image" src="https://github.com/user-attachments/assets/c017aff3-8ee9-4be9-a93e-f72512f79f02" />

### OCR Capture showcase: 
Tokenizer: kuromoji
OCR: tesseract
https://github.com/user-attachments/assets/a307f4b6-21d7-4f1c-864c-cb3a265101c9

## TOKENIZATION AND DICTIONARY PARSED OUTPUT (ALSO THE PROBLEM IN BETWEEN)

#### Let's look at the expression "どうしようかなー" ("I wonder what I should do...") for this example. 
This expression can be broken down into smaller parts, which each have an individual meaning as follows:
どう - how, in what way, how about...
〜しよう - let’s do
かな - I wonder, I guess...
*This will be useful when looking at the tokenized output; the shown translations/breakdowns aren't the only possible way to break this expression down, you could also use "どうしよう" + "かな" (arguably more accurate) 

When we look at this expression without any tokenization and compare it against imported dictionaries, repeating this while removing one character each time, we end up with multiple unique dictionary entries like this: 
<img width="503" height="171" alt="image" src="https://github.com/user-attachments/assets/431434b8-9df2-49ae-bd64-efe1499c1a19" />

(Using the same expression as an example) When we run the tokenizer on this expression, we end up losing potential dictionary matches if any part of the text (The following console logs are not the prettiest; I apologize): 

<img width="314" height="660" alt="image" src="https://github.com/user-attachments/assets/c4c7f0cc-417f-48b6-968a-8a933e9cff46" />
<img width="357" height="456" alt="image" src="https://github.com/user-attachments/assets/b0cffbe4-c4bf-40e5-8712-8e58ab8e2415" />

Here we can see how our expression gets broken down into fragments as small as possible while making sure each segment still has a grammatical meaning, similar to how it was broken down earlier.

#### Why would you need to tokenize/do a morphological analysis if dictionaries on their own seem enough

The issue arises in cases where we have a sentence where verbs, nouns, etc., have inflections added to them. Unless the inflections are not standalone words/expressions that end up having their own meaning, dictionaries would not have any matches. (For example, past tenses of verbs would not have matches)
When I return to this project, the first approach (and the only one that came to mind as of now) I'll try is Dictionary lookups into tokenized text, where I'd have to score the responses from each based on criteria I've not thought of yet. (Example: 食べった, using the dictionary lookups while removing characters would result in　食,　while the tokenizer will show the base form　食べる. I'd want to show both of these. However, the score will be the indicator of which form is more likely to show what the user is looking for.) 

### YOMITAN LOOKUPS (the browser extension which serves as a reference for this whole project) 
Using the example of "どうしよう" we can see that the extension shows multiple entries for the scanned text (starting from the longest 'most likely' match) 
<img width="415" height="289" alt="image" src="https://github.com/user-attachments/assets/1f09ad7b-bc5e-476b-b6fd-ee8f99bfadd8" />
<img width="431" height="316" alt="image" src="https://github.com/user-attachments/assets/68a380af-b1a6-4906-8b65-6f5b1c9b4d1c" />
These are just some examples, the actual number of matches depends on dictionaries (like names, places etc.) 

