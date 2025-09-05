<script setup>
import { onMounted, ref, watch } from 'vue';

const questions = ref([]);

const lyric = ref(''); 
const displayLyric = ref([]);
const openIndex = ref('');
const stack = ref([]);
const errorMsg = ref('');

const isStorePageOpen = ref(false);
const toggleStorePage = () => {
  isStorePageOpen.value = !isStorePageOpen.value;
};
const newQestion = ref('');

const isSelectionPageOpen = ref(false);
const toggleSelectionPage = () => {
  isSelectionPageOpen.value = !isSelectionPageOpen.value;
};

onMounted(() => {
  const savedQuestions = localStorage.getItem('lyric-quiz-questions');
  if (savedQuestions) {
    questions.value = JSON.parse(savedQuestions);
  }
});

function saveNewQuestion() {
  const question = newQestion.value.trim();
  if (!question) {
    return;
  }
  questions.value.push(question);
  localStorage.setItem('lyric-quiz-questions', JSON.stringify(questions.value));
  isStorePageOpen.value = false;
};

function removeQuestion(index) {
  questions.value.splice(index, 1);
  localStorage.setItem('lyric-quiz-questions', JSON.stringify(questions.value));
};

function loadQuestion(index) {
  lyric.value = questions.value[index];
  isSelectionPageOpen.value = false;
}

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
  <v-dialog
    v-model="isStorePageOpen"
    persistent
  >
    <v-sheet class="dialog-content">
      <v-toolbar flat>
        <v-toolbar-title>出題を保存</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="isStorePageOpen = false">
          <v-icon icon="mdi-close"></v-icon>
        </v-btn>
      </v-toolbar>
      <v-divider></v-divider>
      <v-card-text>
        <v-text-field
          v-model="newQestion"
          label="出題"
          type="text"
          variant="outlined"
          clearable
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="saveNewQuestion">保存</v-btn>
        <v-btn text @click="isStorePageOpen = false">閉じる</v-btn>
      </v-card-actions>
    </v-sheet>
  </v-dialog>

  <v-dialog
    v-model="isSelectionPageOpen"
    persistent
  >
    <v-sheet class="dialog-content">
      <v-toolbar flat>
        <v-toolbar-title>出題を選択</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="isSelectionPageOpen = false">
          <v-icon icon="mdi-close"></v-icon>
        </v-btn>
      </v-toolbar>
      <v-divider></v-divider>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="(question, index) in questions"
            :key="index"
          >
            <v-list-item-title>{{ question }}</v-list-item-title>
            <v-btn text @click="loadQuestion(index)">選択</v-btn>
            <v-btn icon @click="removeQuestion(index)">
              <v-icon icon="mdi-delete"></v-icon>
            </v-btn>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="isSelectionPageOpen = false">閉じる</v-btn>
      </v-card-actions>
    </v-sheet>
  </v-dialog>


  <v-container class="lyric-quiz">
    <v-sheet elevation="4" class="pa-4 height-auto width-auto">
      <div class="mb-4"> 
        <v-btn
          class=""
          color="primary"
          @click="toggleStorePage()"
          block
        >出題を保存</v-btn> 
      </div>
      <div class="">
        <div class="question-field text-h5 mb-4">
          <v-btn
            class="load-btn"
            color="primary"
            @click="toggleSelectionPage()"
            block
          >読み込み</v-btn> 
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
.lyric-quiz {
  max-width: 600px;
  margin: 2em auto;
}
.lyric {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  letter-spacing: 0.2em;
  gap: 0.5em;
  margin-bottom: 1em;
}
.index-char {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 2.2em;
  margin: 0 0.1em;
  font-size: 1.1em;
  background: #f5f5f5;
  border-radius: 6px;
  padding: 0.2em 0.3em;
  box-shadow: 0 1px 2px #0001;
}
.index-char span:first-child {
  font-size: 0.7em;
  color: #888;
}
.dialog-content {
  width: 80%;
  margin: 0 auto;
}
.v-sheet {
  border-radius: 12px;
}
.v-list-item {
  border-bottom: 1px solid #eee;
}
.v-list-item:last-child {
  border-bottom: none;
}
.v-btn {
  margin: 0 0.2em;
}
.btn-area {
  display: flex;
  justify-content: center;
}
.v-card-title, .text-h5, .text-h4 {
  text-align: center;
}
.mb-4 {
  margin-bottom: 1.5em !important;
}
.mb-2 {
  margin-bottom: 1em !important;
}
.pa-4 {
  padding: 2em !important;
}
@media (max-width: 600px) {
  .lyric-quiz {
    max-width: 98vw;
    padding: 0.5em;
  }
  .v-sheet {
    padding: 1em !important;
    max-width: 100%;
  }
  .index-char {
    min-width: 1.5em;
    font-size: 1em;
    padding: 0.1em 0.2em;
  }
}
</style>
