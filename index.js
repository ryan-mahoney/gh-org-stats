const { Octokit } = require("@octokit/rest");
const dayjs = require("dayjs");

var weekOfYear = require("dayjs/plugin/weekOfYear");
dayjs.extend(weekOfYear);

require("dotenv").config();

const getPRs = async (octokit, org, sinceDate) => {
  const query = `user:${org} is:pr sort:updated-desc updated:>${sinceDate}`;
  const items = await octokit.paginate(octokit.search.issuesAndPullRequests, {
    q: query,
    per_page: 100
  });

  return items.reduce((acc, pr) => {
    const {
      user: { login },
      updated_at: updated
    } = pr;
    const [date] = updated.split("T");
    const [year] = date.split("-");
    const week = `${year}-${dayjs(date).week()}`;

    // bracket by week
    if (!(week in acc)) acc[week] = {};

    // count by user
    if (login in acc[week]) {
      acc[week][login]++;
    } else {
      acc[week][login] = 1;
    }
    return acc;
  }, {});
};

const sinceDate = `${dayjs().subtract(28, "days").format("YYYY-MM-DD")}`;
const { token, org } = process.env;
const oktokit = new Octokit({ auth: token });

getPRs(oktokit, org, sinceDate).then((data) => {
  const tabDelimited = Object.keys(data).reduce(
    (acc, year) =>
      acc.concat(
        Object.keys(data[year]).map(
          (login) => `${year}\t${login}\t${data[year][login]}`
        )
      ),
    []
  );
  tabDelimited.sort();
  tabDelimited.forEach((line) => console.log(line));
});
