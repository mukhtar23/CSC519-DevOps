# HW3-DevOps

NC State University: CSC 519 - DevOps

#### HW3 - Caching with Redis

## Instructions

- [HW Link](https://github.com/CSC-DevOps/Course/blob/master/HW/HW3.md)
- [Workshop Link](https://github.com/CSC-DevOps/Caches)

## Conceptual Questions

1. Describe three desirable properties for infrastructure.
    - Availability: no or limited interruption to provided services
    - Scalability: ability to increase specific units in response to demand
    - Efficiency: avoid redundant work, shift responsiblity to low cost components

2. Describe some benefits and issues related to using Load Balancers.
    - Benefits of Load Balancers: 
      - sends traffic to healthy instances
      - request new instances as needed
      - ensures availabilty and scalabililty
      - allows you to better utilize your resources
    - Issues of Load Balancers:
      - when using load balancers, the # of TCP connections and # of servers must be equal so it can distribute workload evenly
        - sometimes this distribution is hard to do
      - when multiple servers are present, all requests and infromation during a user's session are stored in different backend servers
        - this disrupts the user's session

3. What are some reasons for keeping servers in seperate availability zones?
    - Keeping servers in separate availability zones helps support isolation and spreads risk by operating instances in independent pools
    - It ensures availability and robustness
    - It's useful for supporting certain deployment strategies

4. Describe the Circuit Breaker and Bulkhead pattern.
    - Circuit Breaker Pattern:
      - it handles faults that might take a variable amount of time to recover from, when connecting to a remote service or resource
      - can improve the stability and resiliency of an application
    - Bulkhead Pattern:
      - type of application design that is tolerant to failure
      - elements of an application are isolated into pools so that if one fails, the others will continue to function.

## Screencast

https://www.youtube.com/watch?v=k6iTRgtJy6g

