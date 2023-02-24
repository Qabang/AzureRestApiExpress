const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require("https");
const fs = require('fs');

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

const TFSCHANGESETSURL = "https://techtfs01.develop.local/DefaultCollection/Candidator/_apis/tfvc/changesets?searchCriteria.itemPath=/candidator&api-version=4.1"
const WORKITEM_API_URL = "https://dev.azure.com/iverdevelop/iver_Portal/_apis/git/repositories/{project}/pullRequests/{id}/workitems?api-version=7.0"
const REPO_API_URL = "https://dev.azure.com/iverdevelop/iver_Portal/_apis/git/repositories/{project}/pullrequests?searchCriteria.status=completed&api-version=7.0"
const BLAZOR_PROJECT = "Iver_Portal"
const LEGACY_PROJECT = "Iver.Portal.Legacy"
const WORK_ITEM_URL_BASE = "https://dev.azure.com/iverdevelop/iver_Portal/_workitems/edit/"


router.get('/', async function (req, res, next) {
    res.render('index', { todaysDate: new Date().toISOString().split('T')[0], });
});

router.post('/', async function (req, res) {
    if (!process.env.pat) {
        throw new Error('PAT is either undefined or .env file is not valid.');
    }
    let data = req.body;

    var config = {
        auth: {
            username: '',
            password: `${process.env.pat}`
        }
    }

    let LegacyRepos = await getRepos(config, data.date, REPO_API_URL.replace('{project}', LEGACY_PROJECT))
    let BlazorRepos = await getRepos(config, data.date, REPO_API_URL.replace('{project}', BLAZOR_PROJECT))
    let TfsItems = await getTfsChangesets(data.date);

    LegacyItems = await getWorkitem(config, LegacyRepos, LEGACY_PROJECT);
    BlazorItems = await getWorkitem(config, BlazorRepos, BLAZOR_PROJECT);
    res.render('index', { choosenDate: data.date, todaysDate: new Date().toISOString().split('T')[0], LegacyItems: LegacyItems, BlazorItems: BlazorItems, TfsItems: TfsItems });
})

router.post('/send', async function (req, res) {
    let { htmlbody } = req.body;

    let recipient = process.env.recipient
    let recipientCopys = process.env.recipientcopys
    let emailSubject = process.env.emailSubject 
    let emailBody = process.env.emailBody
    let filePath = `${appRoot}/public/Assets/Files/current-uppdates.html`
    let url = `mailto:${recipient}?cc=${recipientCopys}&subject=${emailSubject}&body=${emailBody}`

    await fs.writeFile(filePath, htmlbody, (err) => {
        if (err) {
            throw err;
        }

        res.redirect(url)
    });
})

async function getWorkitem(config, repos, project) {
    let reposData = [];
    let workitem_url = WORKITEM_API_URL.replace('{project}', project)

    for (let i = 0; i < repos.length; i++) {
        await axios.get(workitem_url.replace('{id}', repos[i].pullRequestId), config)
            .then(function (response) {
                let title = repos[i].completionOptions.mergeCommitMessage.split("\n\n")[0];

                reposData.push({
                    title: title,
                    url: response.data.value[0] ? `${WORK_ITEM_URL_BASE}${response.data.value[0].id}` : null
                })
            })
    }

    sortedData = reposData.sort(function (a, b) {
        if (a.title.toLowerCase() > b.title.toLowerCase()) { return 1; }
        if (a.title.toLowerCase() < b.title.toLowerCase()) { return -1; }
        return 0;
    });
    return sortedData;
}

async function getRepos(config, startDate, url) {
    let repos = [];

    await axios.get(url, config)
        .then(function (response) {
            response.data.value.forEach(item => {
                let date = item.completionQueueTime.split('T')[0]
                if (new Date(date) >= new Date(startDate)) {
                    repos.push(item)
                }
            });
        });
    return repos
}

async function getTfsChangesets(startDate) {
    let repos = [];
    var config = {
        httpsAgent,
        auth: {
            username: '',
            password: `${process.env.tfspat}`
        }
    }

    await axios.get(TFSCHANGESETSURL, config)
        .then(function (response) {
            if (response.status == 200) {
                response.data.value.forEach(item => {
                    let date = item.createdDate.split('T')[0]

                    if (new Date(date) >= new Date(startDate)) {
                        let id = null;
                        let commentStringArray = item.comment.split(' ')

                        let index = commentStringArray.findIndex((w) => w.includes("#"))

                        if (index != -1) {
                            id = commentStringArray[index].replace('#', '')
                        }

                        let changeset = {
                            title: item.comment,
                            url: id ? WORK_ITEM_URL_BASE + id : null
                        }
                        repos.push(changeset)
                    }
                });
            }
            else {
                throw `${response.status}: ${response.message}`
            }
        });
    return repos
}

module.exports = router;
