var express = require('express');
var router = express.Router();
var axios = require('axios');

const WORKITEM_API_URL = "https://dev.azure.com/iverdevelop/iver_Portal/_apis/git/repositories/{project}/pullRequests/{id}/workitems?api-version=7.0"
const REPO_API_URL = "https://dev.azure.com/iverdevelop/iver_Portal/_apis/git/repositories/{project}/pullrequests?searchCriteria.status=completed&api-version=7.0"
const BLAZOR_PROJECT = "Iver_Portal"
const LEGACY_PROJECT = "Iver.Portal.Legacy"
const WORK_ITEM_URL_BASE = "https://dev.azure.com/iverdevelop/iver_Portal/_workitems/edit/"


router.get('/', async function (req, res, next) {
    res.render('index', { todaysDate: new Date().toISOString().split('T')[0], });
});

router.post('/', async function (req, res) {
    let data = req.body;

    var config = {
        auth: {
            username: '',
            password: `${process.env.pat}`
        }
    }

    let LegacyRepos = await getRepos(config, data.date, REPO_API_URL.replace('{project}', LEGACY_PROJECT))
    let BlazorRepos = await getRepos(config, data.date, REPO_API_URL.replace('{project}', BLAZOR_PROJECT))

    LegacyItems = await getWorkitem(config, LegacyRepos, LEGACY_PROJECT);
    BlazorItems = await getWorkitem(config, BlazorRepos, BLAZOR_PROJECT);
    res.render('index', { choosenDate: data.date, todaysDate: new Date().toISOString().split('T')[0], LegacyItems: LegacyItems, BlazorItems: BlazorItems });

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

module.exports = router;
