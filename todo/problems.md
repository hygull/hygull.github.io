>>> # 'ABCD' => {'a': 1, 'b': 22, 'c': 333, 'd': 4444}
...
>>> inp = 'ABCD'
>>>
>>> out = { ch.lower(): int(str(index+1) * (index + 1)) for index, ch in enumerate(inp) }
>>>
>>> out
{'a': 1, 'c': 333, 'b': 22, 'd': 4444}
>>>

