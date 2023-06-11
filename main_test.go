package main

import (
	"testing"
)

func BenchmarkRegionRead(b *testing.B) {
	for i := 0; i < b.N; i++ {
		regionExtract(2, -7)
	}
}
