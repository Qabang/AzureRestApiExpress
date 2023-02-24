A project that lists completed pullrequests and changesets.

## Getting started

- Create an Personal accesstoken in azure Devops for iverdevelop https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?toc=%2Fazure%2Fdevops%2Forganizations%2Ftoc.json&view=azure-devops&tabs=Windows
- Create an Personal accesstoken in azure Devops for techtfs01 https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?toc=%2Fazure%2Fdevops%2Forganizations%2Ftoc.json&view=azure-devops&tabs=Windows
- Rename .env-example -> .env
- Add both your PAT to the .env file
- Fill in the rest of the data in the .env file
- Start the project

## Create the weekly email

- Choose date and press generate html file button. This will open your email program and will write data to a file located in the projects public/Assets/Files folder
- Follow this guide to embedd the generated html file (current-uppdates.html) in the email. https://www.linkedin.com/pulse/how-insert-html-source-code-outlook-emails-maurizio-la-cava/
- check so that it is looking good and press send.
- Your done 🥳