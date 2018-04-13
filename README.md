# Linkedin

> ## Aim
***Using REST API web services for*** *Authenticating Linkedin account & creating a post containing texts, images, links, videos etc.*

> ## *Requirements*
1. ***Windows system***
	> The Windows system should have the folowing resources (It may be different too. I'll recommend you to have best resources).
	> * *Any of  64-bit Windows 8/8.1/10*
	> * *4 GB RAM*
	> * *x64-based processor* 
	> 
	> Below is the details of my system:
	> * *Windows 10 64-bit*
	> * *4 GB RAM*
	> * *Intel i5 CPU, 3.10 GHz*, x64-based
	> ![enter image description here](https://lh3.googleusercontent.com/5Z4JsFDks9njkXw2LW6RdE766Cp4SRZSFUBj3YkPURCEzmxhUdbAev_pqlftyOJwcR3grYAi9Iep "System details")

2. ***Anaconda with Python2.7***
	> Visit https://www.anaconda.com/download/ and download ***Python 2.7*** version available on right. Now install it and set the *PATH*.
	You can directly download it by clicking on https://repo.continuum.io/archive/Anaconda2-5.1.0-Windows-x86_64.exe link also.
![enter image description here](https://lh3.googleusercontent.com/Tlu5sSL7CV4Dj84XFz93dhxwp9itKnDrp9I3O8WDE983zoswaGXWcu_2V2RRc2cJhQBIZ8ngPoDb "Anaconda")

3. ***Linkedin account (Verified/Confirmed)***
	> If you don't have Linkedin account, visit https://www.linkedin.com/start/join and create. 
	Also make sure, it is verified.
	![enter image description here](https://lh3.googleusercontent.com/RNH5V_f8yXqhLRk5XEFxb3DTqOEaA14OoUvx4JrmFwaI1VMM-qX6PfMBDe6dgl3kVomLu13Au8TE "SignUp")


> ## *Dependencies*
***Note:*** *Do not install it, I have explained it later in this document.*

1. *python-linkedin*
2. *mechanize*
 
> ## Getting started

1. ***Open*** *cmd*
	> Press ***Win+R***
	> Type ***cmd*** in `RUN ` dialog box
	> Hit ***ENTER***
	
2. ***Create*** *working directory (wd)*
	> ***Note:*** *Here my intention is to create* `wd`  inside `D drive` *with name* `Linkedin`. *You may choose different location/folder name for your own.*
	>
	> `C:\Users\rishi>mkdir D:\Linkedin`

3. ***Navigate inside*** *wd*
	> *Go inside the working directory `(wd)`*.
	>
	> `C:\Users\rishi>cd D:\Linkedin`
	> `D:\Linkedin>`

4. ***Create*** *conda environment/virtual environment*
	> *I will recommend you to use conda environment.*
	> ***conda create  -n  linkedin***
	> `D:\Linkedin>conda create --name linkedin`
	
5. ***Activate*** *environment*
	> ***conda activate linkedin***
	>```
	>D:\Linkedin>conda activate linkedin`
	>(linkedin) D:\Linkedin>
	>```
	
6. ***Install*** *dependencies*
	:hash: *Run the following sequence of commands, one after one (in your activated conda environment).*
	> pip install python-linkedin
	> pip install mechanize

7. ***Get*** `API KEY` & `SECRET KEY`
	> * You can read this [[link]](https://developer.linkedin.com/docs/oauth2) if you want detailed explanation about creating Application, Client ID (*API KEY*), Client Secret (*SECRET KEY*) etc.\.
	>
	> * You can click [here [to modify existing app]](https://www.linkedin.com/secure/developer "Modify exisiting linkedin app").  or Click [here [to create new app]](https://www.linkedin.com/secure/developer?newapp= "Create new linkedin app"). In case of creating/registering new application (app), you will need to fill the form with certain data eg. *Company name, Application name, Application description* etc.\. 
	>
	>	Please look at the application's data that I filled in my case.
	> 	#### CREATE AN APPLICATION
	> 1. ***Company Name:*** *Required\**
	> Sjain Ventures
	>
	>2. ***Application Name:*** *Required\**
	> Quantsword-v.1.0
	>
	>3. ***Application Description:*** *Required\**
	> An application that processes data and automatically creates a post on linkedin related to the processed data.
	>
	>4. ***Application Logo:*** *Required\**
	> **Note:** *The image's dimension should be same, it's not pre-mentioned in the form. You will see this error, if in case you uploaded image with different height & width*.
	> \
	> You can download and upload proper logo as per your wish. If you want, 	you may download this [[Q logo]](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlM6qlbBiVxTl-twiNIeg-_TeORnhEZj8e2K80H7l__6sVJCp7 "Q logo").
	>
	> 5. ***Application Use:*** *Required\**
	> ***Note:*** *You may select any of the option from drop-down based on your application's work area.*
	> I selected &raquo; ***Networking***
	>
	>6. ***Website URL:*** *Required\**
	> http://www.sjainventures.com
	>
	>7. ***Privacy Policy URL:***
	> http://www.sjainventures.com/privacy-policy.php
	>
	>8. ***Business Email:*** *Required**
	> contact@sjainventures.com
	>
	>9. ***Business Phone:*** *Required**
	> 7583837700 
	>
	> 10. ***Accept*** the *Linkedin API terms of use by checking the checkbox.
	> 
	> * Finally **SUBMIT** the form & you are done with registering a new application on Linkedin.
	> * You will be automatically redirected to **Application settings** page where you can see your ***Client ID*** & ***Client Secret*** under title ***Application Keys***.
	> * Under title ***Default Application Permissions***, only the first option ***r_basicprofile*** will be checked initially. Check all other options also as we are going to publish a post on linkedin, ***w_share*** is must in our case.
	> * Under title **Auth 1.0** - ***Authorized redirected URLS:*** , provide `http://127.0.0.1:8000`.
	>  * Under title **Auth 2.0**
		I.   ***Default "Accept" Redirect URL:*** , provide `http://127.0.0.1:8000`.
		II.  ***Default "Cancel" Redirect URL:*** , provide `http://127.0.0.1:8000` as well.
	> * Finally ***UPDATE*** the form. 
	> * Copy your ***Client ID*** and ***Client Secret*** and securely store it somewhere, we need it in next step.
	
8. ***Create*** *configuration file*  `linkedin_config.cfg`
	> ***Note*** &raquo; Specify your own linkedin credentials.
	```
	[Secrets]
	api_key=851eh673kiabdc
	secret_key=DTG5u7cABDCixrCw
	username=rishikesh@gmail.com
	password=Rishi@pass123$
	```
10. ***Create*** `posts.py` *module*

	> ***Note*** &raquo; Always specify a url for a high quality image (width>=1200px, height>=600px).
	 ```python
	 # The index of post object in POSTS list that has been selected for posting 
	ACTIVE_POST_INDEX = 0

	# POSTS list, if you want to add new POST, please add it at the beginning 
	POSTS = [
		{
		  "comment": "How to Start Learning Computer Programming",
		  "content": {
		      "title": "How to Start Learning Computer Programming?",
		      "description": "Programming is lots of fun and extraordinarily useful. It allows you be creative.",
		      "submitted-url": "https://www.wikihow.com/Start-Learning-Computer-Programming",
		      "submitted-image-url": "https://www.wikihow.com/Start-Learning/Computer-Programming.jpg"
		  },
		  "visibility": {
		    "code": "anyone"
		  }
		},
		{
		  "comment": "How to Help Others?\nJust try to think about yourelf whether you help others or not.",
		  "content": {
		      "title": "How to Help Others?",
		      "description": "Just try to think about yourelf whether you help others or not.",
		      "submitted-url": "https://www.wikihow.com/Help-Others",
		      "submitted-image-url": "https://www.wikihow.com/images/thumb/9/9c/Volunteer/Volunteer.jpg"
		  },
		  "visibility": {
		    "code": "anyone"
		  }
		},

		{
			"comment": "How to Behave at Work?\nYour behaviour matters at each and every place in the world.",
			"content": {
				"title": "How to Behave at Work?",
				"description": "Everyone likes the good behaviour of others. It is really a nice message for us.",
				"submitted-url": "https://www.wikihow.com/Behave-at-Work",
				"submitted-image-url": "https://www.wikihow.com/images/thumb/BehaveVersion-2.jpg/aidVersion-2.jpg"
			},
			"visibility": {
				"code": "anyone"
			}
		},
		{
			"comment": "Programming is really nice that enables to communicate with machines and design the world.",
			"content": {
				"title": "How to become a great programmer?",
				"description": "I love programming and want to become a great developer one day.",
				"submitted-url": "https://hackernoon.com/how-to-become-the-best-programmer-in-the-world",
				"submitted-image-url": "https://cdn-images-1.medium.com/max/2000/1abc.jpeg"
			},
			"visibility": {
				"code": "anyone"
			}
		}
	]

	```
11. ***Create python file*** `main.py` & *paste the below code*
	```python
	"""
    Get LinkedIn OAuth2 access tokens without having to open a web browser.
    Notes
    -----
    Requires `python-linkedin <https://github.com/ozgur/python-linkedin>`_.
    Assumes that the application API key and secret key are stored in a
    configuration file formatted as follows:
    [Secrets]
    API_KEY = WWWWWWWW
    SECRET_KEY = XXXXXXXX
    """

    import re
    import json
    import ConfigParser as cp
    import urlparse
    import config as conf
    from linkedin import linkedin
    import mechanize
    from mechanize import _response
    from mechanize import _rfc3986


    def get_updated_url(url):
        front_url_part, back_url_part = url.split("?")

        print front_url_part, "\n"
        print back_url_part, "\n" 

        parameters_pairs = back_url_part.split("&")
        print parameters_pairs, "\n"
        parameters_pairs.remove(parameters_pairs[0])
        print parameters_pairs, "\n"

        scope = "scope=r_basicprofile%20r_emailaddress%20w_share"
        parameters_pairs.insert(0, scope)

        print parameters_pairs, "\n"

        final_url = "?".join([front_url_part, "&".join(parameters_pairs)])

        print final_url

        return final_url


    # Read secrets:
    cfg_file = 'linkedin_config.cfg'
    config = cp.ConfigParser()
    config.read(cfg_file)

    if not config.has_section('Secrets'):
        raise RuntimeError('no secrets specified')

    secrets = {}
    for s in config.items('Secrets'):
        secrets[s[0]] = s[1]

    print "[1]", secrets, "\n"

    class MyRedirectHandler(mechanize.HTTPRedirectHandler):
        def http_error_302(self, req, fp, code, msg, headers):

            # Code from mechanize._urllib2_fork.HTTPRedirectHandler:
            if 'location' in headers:
                newurl = headers.getheaders('location')[0]
            elif 'uri' in headers:
                newurl = headers.getheaders('uri')[0]
            else:
                return
            newurl = _rfc3986.clean_url(newurl, "latin-1")
            newurl = _rfc3986.urljoin(req.get_full_url(), newurl)

            new = self.redirect_request(req, fp, code, msg, headers, newurl)
            if new is None:
                return

            if hasattr(req, 'redirect_dict'):
                visited = new.redirect_dict = req.redirect_dict
                if (visited.get(newurl, 0) >= self.max_repeats or
                    len(visited) >= self.max_redirections):
                    raise HTTPError(req.get_full_url(), code,
                                    self.inf_msg + msg, headers, fp)
            else:
                visited = new.redirect_dict = req.redirect_dict = {}
            visited[newurl] = visited.get(newurl, 0) + 1

            fp.read()
            fp.close()

            # If the redirected URL doesn't match 
            new_url = new.get_full_url()
            if not re.search('^http(?:s)?\:\/\/.*www\.linkedin\.com', new_url):
                return _response.make_response('', headers.items(), new_url, 200, 'OK') 
            else:
                return self.parent.open(new)

        http_error_301 = http_error_303 = http_error_307 = http_error_302
        http_error_refresh = http_error_302

    # Set up headless browser:
    br = mechanize.Browser()
    br.set_cookiejar(mechanize.CookieJar())
    br.handler_classes['_redirect'] = MyRedirectHandler
    br.set_handle_redirect(True)
    br.set_handle_robots(False)

    return_uri = 'http://127.0.0.1:8000'
    auth = linkedin.LinkedInAuthentication(secrets['api_key'],
                                           secrets['secret_key'],
                                           return_uri,
                                           linkedin.PERMISSIONS.enums.values())


    print "[2]", dir(auth), "\n"
    print "[3]", auth.authorization_url, "\n"
    print "[4]", auth.authorization_code, "\n"
    print "[5]", auth.AUTHORIZATION_URL, "\n"
    print "[6]", auth.ACCESS_TOKEN_URL, "\n"

    br.set_handle_robots(False) # ADDED BY ME
    br.set_handle_equiv(False) # ADDED BY ME
    br.addheaders = [('User-agent', 'Mozilla/5.0')] # ADDED BY ME

    br.open(get_updated_url(auth.authorization_url))
    br._factory.is_html = True # ADDED BY ME

    count = 0
    for form in br.forms():
        count = count + 1
        print count +1, ")", form

    print count, "\n"

    br.select_form(nr=0)
    br.form['session_key'] = secrets['username']
    br.form['session_password'] = secrets['password']
    r = br.submit()

    print urlparse.parse_qs(urlparse.urlsplit(r.geturl()).query)
    auth.authorization_code = urlparse.parse_qs(urlparse.urlsplit(r.geturl()).query)['code']
    access_token = auth.get_access_token()

    print "ACCESS TOKEN OBJECT:- ", access_token, "\n"

    print "ACCESS TOKEN:- ", access_token.access_token, "\n"
    app = linkedin.LinkedInApplication(token=access_token)

    print help(app.submit_share), "\n"

    # READ ARRAY OF POST
    post = conf.POSTS[conf.ACTIVE_POST_INDEX] # INDEX starts from 0 onwards
    content = post["content"]

    comment = post["comment"]
    title = content["title"]
    description = content["description"]
    submitted_url = content["submitted-url"]
    submitted_image_url = content["submitted-image-url"]
    visibility_code = post["visibility"]["code"]

    print "CREATING A NEW POST ON LINKEDIN", "\n"

    response = app.submit_share(
        comment=comment,
        title=title,
        description=description,
        submitted_url=submitted_url,
        submitted_image_url=submitted_image_url,
        visibility_code=visibility_code
    )

    print response, "\n"
    print dir(response), "\n"

    print "SUCCESSFULLY CREATED POST ON LINKEDIN", "\n"
	```
12. ***Run*** *python code*
	> `python main.py`
	
13. ***Check*** *your post on linkedin*
	> `Welcome, you are done with your post.`
	
14. ***Fix*** *any issues* 
	> :smile:
> ## *References*

* REST API usage for sharing a content on linkedin - [[1]](https://developer.linkedin.com/docs/share-on-linkedin "API Document")
* REST API console to test Linkedin APIs - [[2]](https://apigee.com/console/linkedin, "REST API Console")
* Company pages - [[3]](https://developer.linkedin.com/docs/company-pages "linkedin company page")
* Undestanding permissions (*r_fullprofile, r_network, r_contactinfo, rw_nus, rw_groups, w_messages*) - [[4]](https://developer.linkedin.com/support/developer-program-transition "Linkedin developer program transition")

* Error in Python Mechanize - "mechanize._mechanize.BrowserStateError: not viewing HTML" - [[5, stkovrflw]](https://stackoverflow.com/questions/3464931/error-in-python-mechanize-mechanize-mechanize-browserstateerror-not-viewing "mechanize module, browser state error")
	`br._factory.is_html = True`

* Access to posting shares denied (after getting access token) - 
[[6, stkovrflw]](https://stackoverflow.com/questions/13601768/linkedin-javascript-api-access-to-people-denied "Access to posting shares denied")

* Linkedin API terms of use - [[7]](https://developer.linkedin.com/legal/api-terms-of-use)