import { jobs } from "../data/jobsData.js";

export const matchJobs = (userSkills) => {
  return jobs.map(job => {
    let matchCount = 0;

    job.skills.forEach(skill => {
      if (userSkills.includes(skill.toLowerCase()))
        matchCount++;
    });

    const score = Math.round((matchCount / job.skills.length) * 100);

    return { ...job, score };
  })
  .sort((a,b)=>b.score-a.score);
};
