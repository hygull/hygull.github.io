import re

def get_inputs(n=3):
	inp = input('Enter a sentence with at least 3 numbers included: ').strip()
	arr =  re.sub(r'[^0-9]+', ' ', inp).strip().split()

	if len(arr) < n:
		for i in range(n):
			try:
				arr[i]
			except IndexError as e:
				arr.append(0)

	n, a, k, *rest = list(map(int, arr))

	return (n, a, k, rest)

# Start
if __name__ == "__main__":
	# Get 3 numbers
	out1 = get_inputs() 
	n, a, k, rest = out1
	
	print('n =', n)
	print('a =', a)
	print('k =', k)
	print('rest = ', rest)
