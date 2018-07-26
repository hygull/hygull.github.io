<!DOCTYPE html>
<head>
<!-- <script src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?lang=css&amp;skin=sunburst"></script> -->
<script src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js"></script>
<style type="text/css">
    pre.prettyprint {
        font-size: 20px;
        font-family: consolas;
        border:0px;
    }
</style>
</head>
<body onload='PR.prettyPrint()'>
	<pre class='prettyprint linenums' id='code-mine'>
"""
    {
        'aim': 'To use DataFrame in Python',
        'codedBy': 'Rishikesh Agrawani'
    }
"""

import json
import pandas as pd
import datetime
import time # {Added}

json_backup = 'temp.json'
df_store = pd.DataFrame(columns=["Time", "Average Rate"])

average_rate = 50  # {Added}
count = 1          # {Added}

while True:
    # Doing some data gathering (code not included here) at each loop
    time_data = str(datetime.datetime.now())

    # Store micro seconds of datetime as average 
    # (For test only, use your own logic to calculate it)
    # In case of 2018-06-03 18:44:56.220778 => 220778
    average_rate = int((time_data.split()[1]).split('.')[1]) 

    try:
        df_store = pd.read_json(json_backup)

        df_store = df_store.append({
            "Time": time_data,
            "Average Rate": average_rate
        }, ignore_index=True)
        
        df_store.to_json(json_backup)
        print (df_store)
        print ("***********************************************")    	
    except Exception as e:
        df_store = df_store.append({
            "Time": time_data,
            "Average Rate": average_rate
            }, ignore_index=True)

        df_store.to_json(json_backup)
        print(df_store)
        print("***********************************************")

    # time.sleep(30.0 - ((time.time() - starttime) % 30.0))  # {Commented}
    print(count, "temp.json updated")

    # If user presses Y/y then continue otherwise exit from loop
    choice = input("\n" + str(count) + " Do you want to continue the operation (Y/N): ")
    if choice == 'y' or choice == 'Y':
    	count = count + 1
    	continue
    else:
    	break
	</pre>

</body>