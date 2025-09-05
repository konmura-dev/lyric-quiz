<script setup>
import { ref, watch } from 'vue';

const lyric = ref(''); 
const displayLyric = ref([]);
const openIndex = ref('');
const stack = ref([]);
const errorMsg = ref('');

watch(lyric, (newLyric) => {
  if (!newLyric) {
    displayLyric.value = [];
    return;
  }
  displayLyric.value = newLyric.split('').map(c => '＿');
  stack.value = [];
  errorMsg.value = '';
});

function zeroPad(num, len) {
  return String(num).padStart(len, '0');
}

function openChar() {
  errorMsg.value = '';
  const idx = Number(openIndex.value);
  
  if (stack.value.includes(idx)) {
    errorMsg.value = 'その文字は既に開かれています。';
    return;
  }

  if (isNaN(idx) || idx < 0 || idx >= lyric.value.length) {
    errorMsg.value = '有効な番号を入力してください。';
    return;
  }

  displayLyric.value[idx] = lyric.value[idx];
  openIndex.value = '';
  stack.value.push(idx);
}

function undo() {
  if (stack.value.length === 0) {
    errorMsg.value = '戻せる操作がありません。';
    return;
  }
  const lastIdx = stack.value.pop();
  displayLyric.value[lastIdx] = '＿';
}

function copyDisplayLyricToClipboard() {
  const lyricArray = displayLyric.value;
  const idxArray = lyricArray.map((_, idx) => zeroPad(idx, 2));
  const textToCopy = `${idxArray.join(" ")}\n${lyricArray.join(" ")}`;
  navigator.clipboard.writeText(textToCopy)
}

</script>

<template>
  <v-container class="lyric-quiz">
    <v-sheet elevation="4" class="pa-4 height-auto">
      <div class="">
        <div class="text-h5 mb-4">
          <v-text-field
            v-model="lyric"
            label="歌詞を入力してください"
            type="text"
            variant="outlined"
            clearable
          />
        </div>

        <div class="lyric text-h5 mb-4">
          <div class="index-char" v-for="(char, idx) in displayLyric" :key="idx">
            <span>{{ zeroPad(idx, 2) }}</span>
            <span>{{ char }}</span>
          </div>
        </div>
        
        <div class="btn-area mb-4">
          <v-btn
            class="btn"
            v-if="lyric"
            icon
            size="small"
            color="primary"
            @click="copyDisplayLyricToClipboard"
            title="表示中の歌詞をクリップボードにコピー"
          >
            <v-icon icon="mdi-content-copy"></v-icon>
          </v-btn>

          <v-btn
            class="btn"
            v-if="lyric"
            icon
            size="small"
            color="primary"
            @click="undo"
            title="一つ前に戻す"
          >
            <v-icon icon="mdi-undo-variant"></v-icon>
          </v-btn>

          <v-btn
            class="btn"
            v-if="lyric"
            icon
            size="small"
            color="red"
            @click="displayLyric = lyric.split(''); stack = []"
            title="正解を表示"
          >
            <v-icon icon="mdi-eye-outline"></v-icon>
          </v-btn>
        </div>
        <v-row class="mb-2" align="center">
          <v-col cols="8">
            <v-text-field
              v-model.number="openIndex"
              type="number"
              min="0"
              label="開けたい文字の番号"
              hide-details
              variant="outlined"
            />
          </v-col>
          <v-col cols="4">
            <v-btn color="primary" @click="openChar" block>文字をオープン</v-btn>
          </v-col>
        </v-row>
        <v-alert v-if="errorMsg" type="error" class="mb-2">{{ errorMsg }}</v-alert>
      </div>
    </v-sheet>
  </v-container>
</template>

<style scoped>
.question {
  display: flex;
  align-items: center;
}
.index-char {
  display: flex;
  flex-direction: column;
  text-align: center;
  margin: 0 0.1em;
}
.lyric {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  letter-spacing: 0.2em;
}
.btn-area {
  display: flex;
  justify-content: center;
  align-items: center;
}
.btn {
  margin: 0 0.5em;
}
</style>
