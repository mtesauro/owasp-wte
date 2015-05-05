To convert a package from the legacy method to the new FPM-based method:

1. In the root directory of the repo, mkdir for [package name]

```
$ pwd
/home/mtesauro/projects/wte-github
$ mkdir webgoat
```

2. Rsync the contents of that package from the legacy-owasp-wte repo.

```
$ cd /home/mtesauro/projects/legacy-owasp-wte/conversion
$ rsync -Pav webgoat/contents/ ../../wte-github/webgoat/
```

3. Return to the new repo and move the tmp file to ./opt/owasp

```
$ cd ../../wte-github/webgoat
$ mv tmp opt/owasp
```

4. Create a directory called contents and move any directory structures that belong in the package like opt and usr

```
$ ls
DEBIAN  opt  usr
$ mv opt contents/
$ mv usr contents/
```

5. Create a directory called source and populate it with the source for the project being packaged.

```
$ mkdir source
$ cd source
$ wget http://www.owasp.org/source/for/webgoat/webgoat-6.0.1.tar.gz
$ cd ..
```

6. Create a README.md for this package.  This usually includes a brief description of the thing being packaged, a URL to its home/project page and a link to a source code repo.

```
$ vi ./README.md  (or use your favorite text editor)
```

7. Create a build script called build-[package name] - use another one from the repo as a starter file.  Use the comments in that script to help you decide how to convert it to this package.  Mostly, it setting several bash variables.

```
$ cp ../zap/build-zap ./build-webgoat
$ vi ./build-webgoat  (or use your favorite text editor)
```

8. Fix the postinst script in the DEBIAN directory.  Change paths from /tmp/whatever/path to /opt/owasp/tmp/whatever/path as package installers complain about using /tmp.

```
$ vi ./DEBIAN/postinst  (or use your favorite text editor)
```

9. Chmod the build script and run it

```
$ chmod u+x build-webgoat
$ ./build-webgoat
  (script output removed)
```

10. Test the new package to ensure it installs and works as expected

```
$ dpkg -i packages/owasp-wte-webgoat_6.0.1-00_all.deb
```

Check that the install is clean, all dependencies are in the package's build script and the menu item is installed/works correctly.

