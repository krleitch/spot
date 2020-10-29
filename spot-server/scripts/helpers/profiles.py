import boto3

# Make sure you have aws configuration setup
# Use ```aws configure```

s3 = boto3.resource('s3')

def main():

    global s3
    bucket = s3.Bucket('spot')
    for obj in bucket.objects.all():
        print(obj.key)


if __name__ == '__main__':
    main()