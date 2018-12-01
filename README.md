# [https://hygull.github.io](https://hygull.github.io)

![MATH](img/latex-math/national-mathematics-day-752x440.jpg)

## Use of apply() on pandas Series, DataFrame

> ##Example 1

```bash
>>> import pandas as pd
>>>
>>> df = pd.DataFrame({
...     "fullname": ["A X", "B M", "T W", "U Y", "P C"],
...     "age": [14, 56, 70, 34, 56],
...     "salary": [300000, 400000, 350000, 100000, 460000]
... })
>>>
>>> df
  fullname  age  salary
0      A X   14  300000
1      B M   56  400000
2      T W   70  350000
3      U Y   34  100000
4      P C   56  460000
>>>
>>> df.fullname.apply(lambda x: x.split()[0]) # first names
0    A
1    B
2    T
3    U
4    P
Name: fullname, dtype: object
>>>
>>> df.fullname.apply(lambda x: x.split()[1]) # last names
0    X
1    M
2    W
3    Y
4    C
Name: fullname, dtype: object
>>>
```

> ##Example 2

```bash
>>> df.fullname.apply(lambda x: x.split()[1]).name # last names
'fullname'
>>>
>>> df.fullname.apply(lambda x: x.split()[1]).index.name # last names
>>> df.fullname.apply(lambda x: x.split()[1]).index
RangeIndex(start=0, stop=5, step=1)
>>>
>>> df.fullname.apply(lambda x: x.split()[1]).index.name == "" # last names
False
>>>
>>> df.fullname.apply(lambda x: x.split()[1]).index.name == None # last names
True
>>>
>>> df.fullname.apply(lambda x: x.split()[1]).index.name is None # last names
True
>>>
```

> #Example 3

```bash
>>> # Sum of all salaries
...
>>> df.salary.sum()
1610000
>>>
>>> # All users with age > 50
...
>>> df.loc[ df.age > 50 ]
  fullname  age  salary
1      B M   56  400000
2      T W   70  350000
4      P C   56  460000
>>>
>>> # All users with age < 50
...
>>> df.loc[ df.age < 50 ]
  fullname  age  salary
0      A X   14  300000
3      U Y   34  100000
>>>
>>> # All users with age == 50
...
>>> df.loc[ df.age == 50 ]
Empty DataFrame
Columns: [fullname, age, salary]
Index: []
>>>
>>>
```

> #Example 4

```sh
>>> df
  fullname  age  salary
0      A X   14  300000
1      B M   56  400000
2      T W   70  350000
3      U Y   34  100000
4      P C   56  460000
>>>
>>> # Subtracting $5 from salaries of each user
...
>>> df.salary = df.salary - 5
>>> df
  fullname  age  salary
0      A X   14  299995
1      B M   56  399995
2      T W   70  349995
3      U Y   34   99995
4      P C   56  459995
>>>
```