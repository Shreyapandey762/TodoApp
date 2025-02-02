import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  View,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';

type Task = {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  dueTime: string;
};

const Stack = createNativeStackNavigator();

const HomeScreen = ({ navigation }: any) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const deleteTask = (id: number) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setTasks(tasks.filter(t => t.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity style={styles.taskHeader} onPress={() => toggleExpand(item.id)}>
              <Text style={styles.taskTitle}>{item.name}</Text>
              <Icon name={expandedId === item.id ? 'chevron-up' : 'chevron-down'} size={16} color="#007BFF" />
            </TouchableOpacity>

            {expandedId === item.id && (
              <View style={styles.taskDetails}>
                <Text>{item.description}</Text>
                {item.dueDate && <Text>Due: {item.dueDate} {item.dueTime}</Text>}
                <View style={styles.taskActions}>
                  <TouchableOpacity onPress={() => navigation.navigate('TaskScreen', { task: item, tasks, setTasks })}>
                    <Icon name="pencil" size={20} color="#007BFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTask(item.id)}>
                    <Icon name="trash" size={20} color="#FF5733" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noTasks}>No tasks yet.</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('TaskScreen', { tasks, setTasks })}>
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const TaskScreen = ({ route, navigation }: any) => {
  const { task, tasks, setTasks } = route.params || {};
  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [dueTime, setDueTime] = useState(task?.dueTime || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const saveTask = () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Error', 'Task name and description are required!');
      return;
    }

    if (task) {
      setTasks(tasks.map(t => (t.id === task.id ? { ...t, name, description, dueDate, dueTime } : t)));
    } else {
      setTasks([...tasks, { id: Date.now(), name, description, dueDate, dueTime }]);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput style={styles.input} placeholder="Task Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
      
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: dueDate ? 'black' : '#aaa' }}>{dueDate || 'Select Due Date'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(_event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDueDate(selectedDate.toISOString().split('T')[0]);
          }}
        />
      )}

      <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
        <Text style={{ color: dueTime ? 'black' : '#aaa' }}>{dueTime || 'Select Due Time'}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={(_event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) setDueTime(selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={saveTask}>
        <Text style={styles.buttonText}>Save Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Tasks' }} />
        <Stack.Screen name="TaskScreen" component={TaskScreen} options={{ title: 'Task' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f8f8' },
  taskItem: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, elevation: 2 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  taskTitle: { fontSize: 18, fontWeight: 'bold' },
  taskDetails: { padding: 16, borderTopWidth: 1, borderTopColor: '#ccc' },
  taskActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  addButton: { backgroundColor: '#007BFF', padding: 16, borderRadius: 50, position: 'absolute', bottom: 20, right: 20 },
  addButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  noTasks: { textAlign: 'center', color: '#666', marginTop: 20 },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, marginBottom: 16 },
  button: { backgroundColor: '#007BFF', padding: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
