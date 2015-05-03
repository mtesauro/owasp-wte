When you have large files - that is files larger then 100MB, GitHub will deny your commit when you git push.

## How to remove those files from the commit and then re-commit the modified change set.

1. Remove the file - **this deletes the file from your local disk**

```
 $ git rm path/to/large/file.big
```

2. Reset 

```
 $ git reset --soft HEAD^
```

3. Re-Commit

```
 $ git commit -m "My sensible commit message"
```

4. Do more coding

## If you don't want to delete the file, then do:

1. Reset 

```
 $ git reset --soft HEAD^
```

2. Reset the unwanted file


```
 $ git reset HEAD path/to/unwanted_file
```

3. Re-Commit

```
 $ git commit -m "My sensible commit message"
```

4. Do more coding
