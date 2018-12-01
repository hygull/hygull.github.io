# [https://hygull.github.io](https://hygull.github.io)

![MATH](img/latex-math/national-mathematics-day-752x440.jpg)

## Use of apply() method on pandas Series, DataFrame

#### Example 1

```py
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

#### Example 2

```python
>>> df.fullname.apply(lambda x: x.split()[1]).name # last names
'fullname'
>>>
>>> df.fullname.apply(lambda x: x.split()[1]).index.name # last names
>>> df.fullname.apply(lambda x: x.split()[1]).index
RangeIndex(start=0, stop=5, step=1)
>>>
>>> df.fullname.apply(lambda x: x.split()[1]).index.name == "" 
False
>>>
>>> df.fullname.apply(lambda x: x.split()[1]).index.name == None 
True
>>>
>>> df.fullname.apply(lambda x: x.split()[1]).index.name is None 
True
>>>
```

#### Example 3

```py
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

#### Example 4

```python
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

#### Example 5

> Adding 1 more column named `joining_date`
>
> `df.joining_date` syntax will not work

```matlab
>>> df["joining_date"] = pd.to_datetime(pd.date_range('2017/08/09', periods=5))
>>>
>>> df
  fullname  age  salary joining_date
0      A X   14  299995   2017-08-09
1      B M   56  399995   2017-08-10
2      T W   70  349995   2017-08-11
3      U Y   34   99995   2017-08-12
4      P C   56  459995   2017-08-13
>>>
```
## `query()` method's usage in place of `df.loc[ df.age < 50 ]` like statements

#### Example 6

```matlab
>>> df.query('age < 50')
  fullname  age  salary joining_date
0      A X   14  299995   2017-08-09
3      U Y   34   99995   2017-08-12
>>>
>>> df.query('age > 50')
  fullname  age  salary joining_date
1      B M   56  399995   2017-08-10
2      T W   70  349995   2017-08-11
4      P C   56  459995   2017-08-13
>>>
>>> df.query('age == 50')
Empty DataFrame
Columns: [fullname, age, salary, joining_date]
Index: []
>>>
>>> df
  fullname  age  salary joining_date
0      A X   14  299995   2017-08-09
1      B M   56  399995   2017-08-10
2      T W   70  349995   2017-08-11
3      U Y   34   99995   2017-08-12
4      P C   56  459995   2017-08-13
>>>
>>> df.loc[0]
fullname                        A X
age                              14
salary                       299995
joining_date    2017-08-09 00:00:00
Name: 0, dtype: object
>>>
>>> df.loc[0,'age']
14
>>> df.loc[0,'age'] = 50
>>> df
  fullname  age  salary joining_date
0      A X   50  299995   2017-08-09
1      B M   56  399995   2017-08-10
2      T W   70  349995   2017-08-11
3      U Y   34   99995   2017-08-12
4      P C   56  459995   2017-08-13
>>>
>>> df.query('age == 50')
  fullname  age  salary joining_date
0      A X   50  299995   2017-08-09
>>>
```


## `at()` method on DataFrame

#### Example 7

```matlab
>>> # get/set single value in Series/DataFrame
...
>>> df
  fullname  age  salary joining_date
0      A X   50  299995   2017-08-09
1      B M   56  399995   2017-08-10
2      T W   70  349995   2017-08-11
3      U Y   34   99995   2017-08-12
4      P C   56  459995   2017-08-13
>>>
>>> df.at[2, 'age']
70
>>> # update that to 71
...
>>> df.at[2, 'age'] = 71
>>> df
  fullname  age  salary joining_date
0      A X   50  299995   2017-08-09
1      B M   56  399995   2017-08-10
2      T W   71  349995   2017-08-11
3      U Y   34   99995   2017-08-12
4      P C   56  459995   2017-08-13
>>>
```

#### `at()` method on Series

#### Example 8 

```matlab
>>> s = pd.Series([1, 3, 4, 5, 99, 33, 45, 56, 67, 88])
>>> s
0     1
1     3
2     4
3     5
4    99
5    33
6    45
7    56
8    67
9    88
dtype: int64
>>>
>>> df.loc[4].at["age"]
56
>>>
>>> s.at[3]
5
>>>
>>> s.at[4]
99
>>>
```