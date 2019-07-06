re.sub() examples

<pre class="prettyprint">
<code>
Administrator@CA MINGW64 /d/Rishikesh/Projects/Working/dropbox-api (master)
$ winpty python
Python 2.7.15 |Anaconda, Inc.| (default, May  1 2018, 18:37:09) [MSC v.1500 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>>
>>> import re
>>>
>>> path = 'C:\Users\Rishikesh\new'
>>> path2 = r'C:\Users\Rishikesh\new'
>>>
>>> path
'C:\\Users\\Rishikesh\new'
>>>
>>> path2
'C:\\Users\\Rishikesh\\new'
>>>
>>> print path
C:\Users\Rishikesh
ew
>>>
>>> print path2
C:\Users\Rishikesh\new
>>>
>>> re.sub(r'[:]*\\', '/', path2)
'C/Users/Rishikesh/new'
>>>
>>> re.sub(r'[:]*\\\\', '/', path2)
'C:\\Users\\Rishikesh\\new'
>>>
>>> re.sub(r'[:]*\\', '/', path)
'C/Users/Rishikesh\new'
>>>
</code>
</pre>

re.split() examples

<pre class="prettyprint">
<code>
>>> s = 'D:12Users78Admin432Desktop'
>>> l = re.split(r"\d+", s)
>>>
>>> l
['D:', 'Users', 'Admin', 'Desktop']
>>>
>>> path = '\\'.join(l)
>>> print path
D:\Users\Admin\Desktop
>>>
>>> path
'D:\\Users\\Admin\\Desktop'
>>>
</code>
</pre>

re.findall()

<pre class="prettyprint">
<code>
>>> s = 'abc23def7jh50wert20pq'
>>> l = re.findall(r'\d+', s)
>>> l
['23', '7', '50', '20']
>>>
>>> new_l = [int(ch) for ch in l]
>>>
>>> new_l
[23, 7, 50, 20]
>>>
>>> sum(new_l)
100
>>>
>>> l = re.findall(r'[a-z]+', s)
>>> l
['abc', 'def', 'jh', 'wert', 'pq']
>>>
</code>
</pre>

finditer() examples

<pre class="prettyprint">
<code>
>>> iter = re.finditer(r'\d+', s)
>>> iter
<callable-iterator object at 0x000000000241D780>
>>>
>>> for m in iter:
...     print m.start(), m.end()
...
3 5
8 9
11 13
17 19
>>>
>>> iter = re.finditer(r'\d+', s)
>>> for m in iter:
...     print s[m.start(): m.end()]
...
23
7
50
20
>>>
>>> l = []
>>> iter = re.finditer(r'\d+', s)
>>> for m in iter:
...     l.append( int( s[m.start(): m.end()] ) )
...
>>> l
[23, 7, 50, 20]
>>>
>>> sum(l)
100
>>>
</code>
</pre>
