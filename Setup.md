# Introduction #

Blah Blah, who needs an intro?


# Details #

Basically, download and unzip into directories eclipse and tomcat.

Launch eclipse, install subclipse. (google how to do that)


Go to preferences->servers->runtime environments and add the tomcat server there, making sure you tick 'Create a new local server' on the page where you select which type of server you want.

Go to 'servers' down the bottom of the main page, double click on your tomcat server, and tick 'publish module contexts to separate XML files', then save.

Use subclipse to check-out the code.
To do that, go to the 'SVN repository exploring' perspective, click on 'Add SVN Repository (a little icon), and put in the address of the repo (dont bother about the --username and stuff). The right click on the repo, select checkout, then the 1st radio button, the one using the wizard.
Check it out as a web->dynamic web project, it should select apache tomcat as the target runtime and configuration settings for you.

Go to the project, run as 'on server' and then select your server, ticking 'always use this server' if you so desire.

navigate to localhost:8080/trafmon in a browser

The gods being willing, you have now got it up and running :)

To commit/update, go to the 'team synchronization' perspective, click synchronize, select SVN, and then go from there. Make sure you dont just commit everything, just things you know you want to add/update, because if you let it it will upload all your personal machine dependent settings to screw the rest if us up.

# Links #

[Tutorial on setting up eclipse for a new web project, I followed it to get our project going](http://www.eclipse.org/webtools/community/tutorials/BuildJ2EEWebApp/BuildJ2EEWebApp.html)

Additional steps that might help with getting tomcat running from within eclipse:

  * nstall the [Tomcat apr](http://tomcat.apache.org/tomcat-6.0-doc/apr.html)