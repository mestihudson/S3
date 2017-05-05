# Listing

## Listing Types

We use three different types of metadata listing for various operations.
Here are the scenarios we use each for:

- 'Delimiter' - when no versions are involved, such as listing buckets
- 'DelimiterVersion' - to list all versions belonging to a bucket
- 'DelimiterMaster' - to list just the master versions of objects in a bucket

## Algorithms

The algorithms for each listing type can be found in the open-source
[scality/Arsenal](https://github.com/scality/Arsenal) repository, in [lib/algos/list](https://github.com/scality/Arsenal/tree/master/lib/algos/list).
