# HW4-DevOps

NC State University: CSC 519 - DevOps

#### HW4 - Monitoring

## Instructions

- [HW Link](https://github.com/CSC-DevOps/Course/blob/master/HW/HW4-monitor.md)
- [Workshop Link](https://github.com/CSC-DevOps/Monitoring)

## Conceptual Questions

1. Compare a channel deployment with a ring deployment model
    - Channel Deployment
        - This promotes changes within channels until release
        - Changes tested in channel. After 2 weeks, changes promoted to next channel, unless fast tracked or booted by release engineer 
    - Ring Deployment
        - This deploys change to ring and release, and then you promote to wider ring (increasing the radius)
        - Promotes change from internal users to early adpoters and wider and wider groups of users
        - Change can stay in ring for weeks
        - To leave a ring, you might have to manually sign off and/or pass more advanced testing (automated/fuzzing tests)

2. Identify 2 situations where an expand/contract deployment could be useful
    - when code changes need to be applied in two places at once. This helps to deliever a new feature without disturbing the existing functionalities.
        - Database: making changes that block accessability to data
            - ex: changing column names
        - Application Libraries: changing to a new library version over a period of time
            - ex: application is still referencing older libraries but need to be updated to reference the new versions or features while maintaining functionality.

3. What are some tradeoffs associated with dark launches?
    - Technical Debt:
        - removing flags is a highly variable practice. Reusing old flags can be disastrous
    - Mixed experiences:
        - inconsistent user experiences can reduce satisfaction
    - Stability:
        - supporting multiple permutations of software can increase engineering costs and redue stability

4. Describe the Netflix style green-blue deployment. What can canary analysis tell us?
    - Blue- green deployment involves two duplicate instances of production infrastructure. One instance receives active traffic while one instance remains dormant and on stand-by. This allows rollback to be easy and fast.
    - They then use canary analysis. Canary analysis uses statistical tests against baseline measures to determine whether a deployment can be safely promoted to more and more users (0.01%, 1%, 10%,...). Each metric is clasiffied as either High, Low, Pass based on confidence intervals. This classify whether a significant difference exists between the canary and baseline metric. This canary score is calculated as the ratio of metrics classified as "Pass" out of the total number of metrics. Ex, 9 out of 10 metrics "Pass" means its a canary score of 90%.

## Screencast

https://www.youtube.com/watch?v=91B6E_u3Xhs

