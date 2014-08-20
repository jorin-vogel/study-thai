backup='backup'
# today=$(date +"%m_%d_%Y")
today=$(date +"%s")

mkdir -p $backup
cp study.db $backup/$today.db
# remove everything older than a month
# ls -t $backup | sed -e '1,30d' | xargs -d '\n' rm
ls -t $backup | sed -e '1,3d' | xargs -d '\n' rm
