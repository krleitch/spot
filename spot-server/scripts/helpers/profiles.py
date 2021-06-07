import boto3

# Make sure you have aws configuration setup
# Use ```aws configure```

client = boto3.client('s3')

# Gets a list of urls to profile picture resources and saves to file

def main():

    global client

    response = client.list_objects_v2(
        Bucket='spottables',
        Delimiter='/',
        MaxKeys=1000,
        Prefix='profile/icons/',
    )

    f = open("profiles.txt", "a")

    for obj in response['Contents']:
        f.write('\'' + obj['Key'] + '\',\n')

    f.close()


if __name__ == '__main__':
    main()