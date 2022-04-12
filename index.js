const { Octokit } = require("@octokit/rest");
require('dotenv').config();

// get token and org from local env file
const { token, org } = process.env;

// instantiate the github Rest API clinet
const octokit = new Octokit({ auth: token });

async function paginate(method) {
    let response = await method({
        q: `user:${org} is:pr`,
        per_page: 100
    })
    let data = response.data.items;
    // var count = 0;
    // octokit.
    // while (octokit.hasNextPage(response)) {
    //     count++;
    //     console.log(`request n°${count}`);
    //     response = await octokit.getNextPage(response);
    //     data = data.concat(response.data.items);
    // }
    return data
}

paginate(octokit.search.issuesAndPullRequests)
    .then(data => {
        //console.log(data);
        const usersAndCount = data.reduce((acc, pr) => {
          const { user: { login } } = pr;
          //console.log(login)
          if (login in acc) {
            acc[login]++; 
          } else {
            acc[login] = 1;
          }
          return acc;
        }, {});

        console.log(usersAndCount)
    })
