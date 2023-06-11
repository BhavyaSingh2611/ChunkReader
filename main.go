package main

import (
	"bytes"
	"compress/zlib"
	"encoding/json"
	"github.com/Tnze/go-mc/nbt"
	"github.com/Tnze/go-mc/save/region"
	"os"
	"strconv"
	"strings"
)

func main() {
	var all = [...][2]int{{0, 0}}
	for _, item := range all {
		regionExtract(item[0], item[1])
	}
}
func regionExtract(x int, z int) {
	var mcRegion, err = region.Open("./r." + strconv.Itoa(x) + "." + strconv.Itoa(z) + ".mca")
	if err == nil {
		for i := 0; i < 32; i++ {
			for j := 0; j < 32; j++ {
				if !mcRegion.ExistSector(i, j) {
					continue
				}
				var chunk, _ = mcRegion.ReadSector(i, j)
				var chunkInterface interface{}
				chunkData, _ := zlib.NewReader(bytes.NewReader(chunk[1:]))
				_, _ = nbt.NewDecoder(chunkData).Decode(&chunkInterface)
				jsonStr, _ := json.Marshal(chunkInterface)
				if strings.Contains(string(jsonStr), "CustomNameVisible") || strings.Contains(string(jsonStr), "item_frame") {
					_ = os.WriteFile("r."+strconv.Itoa(x)+"."+strconv.Itoa(z)+";c."+strconv.Itoa(i)+","+strconv.Itoa(j)+".minecraft", jsonStr, 0666)
				}

			}
		}
		_ = mcRegion.Close()
	}

}
