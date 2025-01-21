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

const LandingScreen = ({ navigation }: any) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  const toggleAccordion = (id: number) => {
    setExpandedTaskId(prevId => (prevId === id ? null : id));
  };

  const deleteTask = (id: number) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setTasks(tasks.filter(task => task.id !== id)),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity
              style={styles.taskHeader}
              onPress={() => toggleAccordion(item.id)}
            >
              <Text style={styles.taskTitle}>{item.name}</Text>
              <Icon
                name={expandedTaskId === item.id ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#007BFF"
              />
            </TouchableOpacity>

            {expandedTaskId === item.id && (
              <View style={styles.taskDetails}>
                <Text>Description: {item.description}</Text>
                {item.dueDate && <Text>Due Date: {item.dueDate}</Text>}
                {item.dueTime && <Text>Due Time: {item.dueTime}</Text>}
                <View style={styles.taskActions}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('TaskScreen', {
                        task: item,
                        tasks,
                        setTasks,
                      })
                    }
                  >
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('TaskScreen', { tasks, setTasks })}
      >
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const TaskScreen = ({ route, navigation }: any) => {
  const { task, tasks, setTasks } = route.params || {};
  const [name, setName] = useState(task ? task.name : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [dueDate, setDueDate] = useState(task ? task.dueDate : '');
  const [dueTime, setDueTime] = useState(task ? task.dueTime : '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (setter: Function, value: any) => {
    setter(value);
    setIsChanged(true);
  };

  const saveTask = () => {
    if (!name || !description) {
      Alert.alert('Validation Error', 'Task name and description are mandatory!');
      return;
    }

    if (task) {
      const updatedTasks = tasks.map((t: Task) =>
        t.id === task.id ? { ...t, name, description, dueDate, dueTime } : t
      );
      setTasks(updatedTasks);
    } else {
      const newTask: Task = {
        id: Math.random(),
        name,
        description,
        dueDate,
        dueTime,
      };
      setTasks([...tasks, newTask]);
    }
    navigation.goBack();
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
      const formattedDate = localDate.toISOString().split('T')[0];
      
      setDueDate(formattedDate);
    }
  };
  

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setDueTime(formattedTime);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Task Name"
        placeholderTextColor="grey"
        value={name}
        onChangeText={value => handleChange(setName, value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        placeholderTextColor="grey"
        value={description}
        onChangeText={value => handleChange(setDescription, value)}
      />
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: dueDate ? 'black' : '#aaa' }}>{dueDate || 'Select Due Date'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
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
          onChange={handleTimeChange}
        />
      )}
      <TouchableOpacity
        style={[styles.button, { opacity: isChanged ? 1 : 0.5 }]}
        disabled={!isChanged}
        onPress={saveTask}
      >
        <Text style={styles.buttonText}>Save Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="LandingScreen"
          component={LandingScreen}
          options={{ title: 'Tasks', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="TaskScreen"
          component={TaskScreen}
          options={({ route }: any) => ({
            title: route.params?.task ? 'Edit Task' : 'Add Task',
            headerTitleAlign: 'center',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 50,
    position: 'absolute',
    bottom: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  noTasks: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
